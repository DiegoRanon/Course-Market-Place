import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CourseHeader from "@/app/components/CourseHeader";

// Mock the VideoPlayer component
jest.mock("@/app/components/VideoPlayer", () => {
  return function MockVideoPlayer({ videoUrl, isCourseVideo }) {
    return (
      <div data-testid="video-player">
        <span data-testid="video-url">{videoUrl}</span>
        <span data-testid="is-course-video">
          {isCourseVideo ? "true" : "false"}
        </span>
      </div>
    );
  };
});

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

// Mock useAuth hook
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

describe("Video Display in Course Header", () => {
  test("should display video player when video_url is provided and showVideo is toggled", async () => {
    const mockCourse = {
      id: "123",
      title: "Test Course with Video",
      description: "This is a test course with video",
      video_url: "https://example.com/test-video.mp4",
      thumbnail_url: "https://example.com/test-thumbnail.jpg",
    };

    // Render the component
    render(<CourseHeader course={mockCourse} />);

    // Initially, the video should not be showing
    expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();

    // Find and click the play button to show video
    const playButton = screen.getByTestId("video-play-button");

    // Use act to handle state updates
    await act(async () => {
      fireEvent.click(playButton);
    });

    // Now the video player should be displayed
    const videoPlayer = screen.getByTestId("video-player");
    expect(videoPlayer).toBeInTheDocument();

    // Check if video container is displayed
    const videoContainer = screen.getByTestId("course-video-container");
    expect(videoContainer).toBeInTheDocument();

    // Check if the video container contains the video URL (using getAllByTestId)
    const videoUrls = screen.getAllByTestId("video-url");
    expect(videoUrls.length).toBeGreaterThan(0);
    expect(videoUrls[0]).toHaveTextContent(
      "https://example.com/test-video.mp4"
    );

    // Check if isCourseVideo flag is set correctly
    const isCourseVideo = screen.getByTestId("is-course-video");
    expect(isCourseVideo).toHaveTextContent("true");
  });

  test("should not display video player when video_url is not provided", () => {
    const mockCourse = {
      id: "123",
      title: "Test Course without Video",
      description: "This is a test course without video",
      thumbnail_url: "https://example.com/test-thumbnail.jpg",
    };

    render(<CourseHeader course={mockCourse} />);

    // Check that video player is not displayed
    expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();

    // Check that play button is not displayed
    expect(screen.queryByTestId("video-play-button")).not.toBeInTheDocument();
  });

  test("should display thumbnail when video is not playing", () => {
    const mockCourse = {
      id: "123",
      title: "Test Course with Video",
      description: "This is a test course with video",
      video_url: "https://example.com/test-video.mp4",
      thumbnail_url: "https://example.com/test-thumbnail.jpg",
    };

    render(<CourseHeader course={mockCourse} />);

    // Check that thumbnail is displayed (img tag with the thumbnail URL)
    const thumbnailImg = screen.getByRole("img");
    expect(thumbnailImg).toBeInTheDocument();
    expect(thumbnailImg).toHaveAttribute(
      "src",
      expect.stringContaining("test-thumbnail.jpg")
    );

    // Check that play button is displayed
    const playButton = screen.getByTestId("video-play-button");
    expect(playButton).toBeInTheDocument();
  });
});
