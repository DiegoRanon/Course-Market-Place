import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import VideoPlayer from "@/app/components/VideoPlayer";

// Mock the video element and its methods
HTMLMediaElement.prototype.play = jest.fn();
HTMLMediaElement.prototype.pause = jest.fn();
HTMLMediaElement.prototype.load = jest.fn();

describe("VideoPlayer Integration", () => {
  test("should render VideoPlayer with correct URL", () => {
    const videoUrl = "https://example.com/test-video.mp4";
    render(<VideoPlayer videoUrl={videoUrl} />);
    
    // Check if video element exists
    const videoElement = screen.getByTestId("video-element");
    expect(videoElement).toBeInTheDocument();
    
    // Check if the video source is correctly set
    const sourceElement = screen.getByTestId("video-source");
    expect(sourceElement).toHaveAttribute("src", videoUrl);
  });
  
  test("should display error message when video fails to load", async () => {
    // Setup
    const videoUrl = "https://example.com/non-existent-video.mp4";
    
    // Mock error event
    const mockErrorEvent = new ErrorEvent("error");
    jest.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {
      // Simulate error event
      setTimeout(() => {
        const videoElements = document.querySelectorAll("video");
        videoElements.forEach(video => {
          video.dispatchEvent(mockErrorEvent);
        });
      }, 0);
    });
    
    render(<VideoPlayer videoUrl={videoUrl} />);
    
    // Check if error message appears
    await waitFor(() => {
      expect(screen.getByText(/failed to load video/i)).toBeInTheDocument();
    });
  });
  
  test("should display loading state while video is loading", async () => {
    // Setup
    const videoUrl = "https://example.com/test-video.mp4";
    
    // Mock loading behavior
    jest.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(function() {
      this.dispatchEvent(new Event("loadstart"));
    });
    
    render(<VideoPlayer videoUrl={videoUrl} />);
    
    // Check if loading indicator is shown
    expect(screen.getByTestId("video-loading")).toBeInTheDocument();
  });
  
  test("should hide loading state when video is ready", async () => {
    // Setup
    const videoUrl = "https://example.com/test-video.mp4";
    
    // Mock loading behavior
    jest.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(function() {
      // Simulate loading completion
      setTimeout(() => {
        this.dispatchEvent(new Event("canplay"));
      }, 0);
    });
    
    render(<VideoPlayer videoUrl={videoUrl} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("video-loading")).not.toBeInTheDocument();
    });
  });
  
  test("should handle different video formats", () => {
    const mp4Url = "https://example.com/video.mp4";
    const webmUrl = "https://example.com/video.webm";
    
    render(<VideoPlayer videoUrl={mp4Url} webmUrl={webmUrl} />);
    
    // Check if both sources are provided
    const sources = screen.getAllByTestId(/video-source/);
    expect(sources[0]).toHaveAttribute("src", mp4Url);
    expect(sources[1]).toHaveAttribute("src", webmUrl);
  });
}); 