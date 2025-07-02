import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import VideoPlayer from "@/app/components/VideoPlayer";
import { supabase } from "@/app/lib/supabase";

// Mock supabase
jest.mock("@/app/lib/supabase", () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: "https://example.com/signed-video.mp4" },
          error: null,
        }),
      }),
    },
  },
}));

describe("VideoPlayer Component", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock HTMLMediaElement methods
    Object.defineProperty(window.HTMLMediaElement.prototype, "load", {
      configurable: true,
      value: jest.fn(),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: jest.fn(),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: jest.fn(),
    });

    // Mock video properties
    Object.defineProperty(window.HTMLMediaElement.prototype, "duration", {
      configurable: true,
      get: () => 300, // 5 minutes
    });
  });

  test("should handle direct URL for course videos", async () => {
    // Render with direct URL
    render(
      <VideoPlayer
        videoUrl="https://example.com/direct-video.mp4"
        isCourseVideo={true}
      />
    );

    // Wait for video to be processed
    await waitFor(() => {
      expect(screen.getByTestId("video-element")).toBeInTheDocument();
    });

    // Verify the video source is set correctly
    const videoElement = screen.getByTestId("video-element");
    expect(videoElement).toHaveAttribute(
      "src",
      "https://example.com/direct-video.mp4"
    );

    // Verify no signed URL was created
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  test("should handle storage path for course videos", async () => {
    // Render with storage path
    render(<VideoPlayer videoUrl="course-video.mp4" isCourseVideo={true} />);

    // Wait for video to be processed
    await waitFor(() => {
      expect(screen.getByTestId("video-element")).toBeInTheDocument();
    });

    // Verify the video source contains the public URL pattern
    const videoElement = screen.getByTestId("video-element");
    expect(videoElement.src).toContain(
      "/storage/v1/object/public/course-videos/course-video.mp4"
    );

    // Verify no signed URL was created since we're using public URL for course videos
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  test("should handle storage path for protected videos", async () => {
    // Render with storage path for non-course video
    render(
      <VideoPlayer videoUrl="protected-video.mp4" isCourseVideo={false} />
    );

    // Wait for video to be processed
    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalledWith("videos");
    });

    // Verify signed URL was requested
    expect(supabase.storage.from).toHaveBeenCalledWith("videos");
    expect(supabase.storage.from().createSignedUrl).toHaveBeenCalledWith(
      "protected-video.mp4",
      3600
    );
  });

  test("should handle errors gracefully", async () => {
    // Mock storage error
    supabase.storage.from().createSignedUrl.mockResolvedValueOnce({
      data: null,
      error: { message: "Storage error" },
    });

    // Render with storage path that will trigger error
    render(<VideoPlayer videoUrl="error-video.mp4" isCourseVideo={false} />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });

    // Check error message content
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "Error loading video: Storage error"
    );
  });

  test("should handle missing video URL", async () => {
    // Render without video URL
    render(<VideoPlayer videoUrl={null} isCourseVideo={true} />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });

    // Check error message content
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "No video URL provided"
    );
  });
});
