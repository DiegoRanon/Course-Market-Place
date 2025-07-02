import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../app/lib/AuthProvider";
import CourseHeader from "../app/components/CourseHeader";
import Curriculum from "../app/components/Curriculum";
import VideoPlayer from "../app/components/VideoPlayer";
import CourseDetails from "../app/courses/[id]/page";
import CourseViewer from "../app/learn/[courseId]/page";
import { supabase } from "../app/lib/supabase";
import { expect, jest, test, describe } from "@jest/globals";
import { getCourseById } from "@/app/lib/api/courses";

// Mock the next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useParams: () => ({
    id: "test-course-id",
    courseId: "test-course-id",
  }),
}));

// Mock AuthProvider
jest.mock("../app/lib/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

// Mock supabase client
jest.mock("../app/lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    storage: {
      from: jest.fn().mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: "test-signed-url" },
          error: null,
        }),
      }),
    },
    upsert: jest.fn().mockResolvedValue({ error: null }),
  },
}));

// Mock our API functions
jest.mock("../app/lib/api/courses", () => ({
  getCourseById: jest.fn().mockResolvedValue({
    data: {
      id: "test-course-id",
      title: "Test Course",
      description: "This is a test course",
      price: 99.99,
      thumbnail_url: "test-thumbnail.jpg",
      creator_id: "test-creator-id",
      what_you_will_learn: "Item 1\nItem 2",
      requirements: "Req 1\nReq 2",
    },
    error: null,
  }),
}));

// Mock the useAuth hook
jest.mock("../app/lib/AuthProvider", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: "test-user" },
  }),
}));

// Mock the VideoPlayer component
jest.mock("../app/components/VideoPlayer", () => {
  return function MockVideoPlayer({ videoUrl }) {
    return <div data-testid="video-player">{videoUrl}</div>;
  };
});

// Mock the next/image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

// Mock the environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-url.com";

describe("Course Page and Video Player Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CourseHeader Component", () => {
    const mockCourse = {
      id: "test-course-id",
      title: "Test Course",
      description: "Test description",
      price: 99.99,
      thumbnail_url: "test-thumbnail.jpg",
      creator_id: "test-creator-id",
    };

    const mockOnEnroll = jest.fn();

    test("renders course title correctly", () => {
      render(<CourseHeader course={mockCourse} onEnroll={mockOnEnroll} />);
      expect(screen.getByText("Test Course")).toBeInTheDocument();
    });

    test("displays correct price", () => {
      render(<CourseHeader course={mockCourse} onEnroll={mockOnEnroll} />);
      expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
    });

    test("calls onEnroll when enroll button is clicked", () => {
      render(<CourseHeader course={mockCourse} onEnroll={mockOnEnroll} />);
      const enrollButton = screen.getByText(/Enroll/i);
      fireEvent.click(enrollButton);
      expect(mockOnEnroll).toHaveBeenCalled();
    });
  });

  describe("Curriculum Component", () => {
    test("displays course curriculum title", () => {
      // Setup the mock response for sections
      require("../app/lib/supabase")
        .supabase.from()
        .select()
        .eq()
        .order.mockResolvedValueOnce({
          data: [],
          error: null,
        });

      render(<Curriculum courseId="test-course-id" />);
      expect(screen.getByText("Course Curriculum")).toBeInTheDocument();
    });

    test("handles no sections state", async () => {
      // Setup the mock response for sections
      require("../app/lib/supabase")
        .supabase.from()
        .select()
        .eq()
        .order.mockResolvedValueOnce({
          data: [],
          error: null,
        });

      render(<Curriculum courseId="test-course-id" />);

      await waitFor(() => {
        expect(
          screen.getByText(/No curriculum available/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("VideoPlayer Component", () => {
    test("renders video player component", () => {
      render(
        <VideoPlayer
          videoUrl="test-video.mp4"
          courseId="test-course-id"
          lessonId="test-lesson-id"
          userId="test-user-id"
          onProgress={jest.fn()}
        />
      );

      expect(screen.getByTestId("video-container")).toBeInTheDocument();
    });

    test("handles video errors gracefully", async () => {
      // Mock a storage error
      require("../app/lib/supabase")
        .supabase.storage.from()
        .createSignedUrl.mockResolvedValueOnce({
          data: null,
          error: { message: "Test error" },
        });

      render(
        <VideoPlayer
          videoUrl="test-video.mp4"
          courseId="test-course-id"
          lessonId="test-lesson-id"
          userId="test-user-id"
          onProgress={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Error loading video/i)).toBeInTheDocument();
      });
    });
  });

  describe("Course Details Page", () => {
    test("displays loading state initially", () => {
      render(<CourseDetails />);
      expect(screen.getByText("Loading course details...")).toBeInTheDocument();
    });

    test("displays course not found if no course data", async () => {
      // Mock getCourseById to return null data
      getCourseById.mockImplementationOnce(() =>
        Promise.resolve({ data: null, error: null })
      );

      render(<CourseDetails />);

      await waitFor(() => {
        expect(screen.getByText("Course Not Found")).toBeInTheDocument();
      });
    });

    test("displays error if API call fails", async () => {
      // Mock getCourseById to return an error
      getCourseById.mockImplementationOnce(() =>
        Promise.resolve({ data: null, error: "API error" })
      );

      render(<CourseDetails />);

      await waitFor(() => {
        expect(screen.getByText("Error Loading Course")).toBeInTheDocument();
      });
    });

    test("should display course video when video_url is provided", async () => {
      // Mock course with video_url
      const mockCourse = {
        id: "123",
        title: "Test Course with Video",
        description: "This is a test course with video",
        price: 99.99,
        creator: {
          id: "creator-1",
          full_name: "Test Creator",
        },
        video_url: "https://example.com/test-video.mp4",
        image_url: "https://example.com/test-image.jpg",
      };

      // Setup the mock return value
      getCourseById.mockResolvedValue({ data: mockCourse, error: null });

      // Render the component
      render(<CourseDetails />);

      // Wait for the course to load
      await waitFor(() => {
        expect(getCourseById).toHaveBeenCalledWith("123");
      });

      // Check if the video container is displayed
      const videoContainer = await screen.findByTestId(
        "course-video-container"
      );
      expect(videoContainer).toBeInTheDocument();

      // Check if the video URL is correct
      const videoUrl = await screen.findByTestId("video-url");
      expect(videoUrl).toHaveTextContent("https://example.com/test-video.mp4");
    });

    test("should not display course video when video_url is not provided", async () => {
      // Mock course without video_url
      const mockCourse = {
        id: "123",
        title: "Test Course without Video",
        description: "This is a test course without video",
        price: 99.99,
        creator: {
          id: "creator-1",
          full_name: "Test Creator",
        },
        image_url: "https://example.com/test-image.jpg",
      };

      // Setup the mock return value
      getCourseById.mockResolvedValue({ data: mockCourse, error: null });

      // Render the component
      render(<CourseDetails />);

      // Wait for the course to load
      await waitFor(() => {
        expect(getCourseById).toHaveBeenCalledWith("123");
      });

      // Check that the video container is not displayed
      expect(
        screen.queryByTestId("course-video-container")
      ).not.toBeInTheDocument();
    });
  });

  describe("Course Viewer Page", () => {
    test("redirects to login if user is not authenticated", () => {
      useAuth.mockReturnValue({ user: null });
      const mockRouter = { push: jest.fn() };
      useRouter.mockReturnValue(mockRouter);

      render(<CourseViewer />);

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("/login")
      );
    });

    test("shows access restricted message if not enrolled", async () => {
      // Mock checkEnrollment to return not enrolled
      supabase
        .from()
        .select()
        .eq()
        .eq.mockImplementationOnce(() => ({
          maybeSingle: jest.fn(() =>
            Promise.resolve({ data: null, error: null })
          ),
        }));

      render(<CourseViewer />);

      await waitFor(() => {
        expect(screen.getByText("Access Restricted")).toBeInTheDocument();
      });
    });

    test("shows no lessons available if course has no lessons", async () => {
      // Mock checkEnrollment to return enrolled
      supabase
        .from()
        .select()
        .eq()
        .eq.mockImplementationOnce(() => ({
          maybeSingle: jest.fn(() =>
            Promise.resolve({ data: { id: "enrollment-id" }, error: null })
          ),
        }));

      // Mock sections with no lessons
      supabase
        .from()
        .select()
        .eq()
        .order.mockImplementationOnce(() => ({
          single: jest.fn(),
          maybeSingle: jest.fn(),
        }));

      render(<CourseViewer />);

      await waitFor(() => {
        expect(screen.getByText("No lessons available")).toBeInTheDocument();
      });
    });
  });

  describe("Course Video Display", () => {
    const mockEnroll = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should display thumbnail when video is available but not playing", () => {
      const course = {
        id: 1,
        title: "Test Course",
        short_description: "This is a test course",
        thumbnail_url: "https://example.com/thumbnail.jpg",
        video_url: "https://example.com/video.mp4",
        creator: {
          full_name: "Test Instructor",
          avatar_url: "https://example.com/avatar.jpg",
        },
      };

      render(<CourseHeader course={course} onEnroll={mockEnroll} />);

      // Should show thumbnail
      expect(screen.getByAltText("Test Course")).toBeInTheDocument();

      // Should show play button overlay
      const playButtonOverlay = screen.getByText("", {
        selector: "div.absolute.inset-0",
      });
      expect(playButtonOverlay).toBeInTheDocument();

      // Should not show video player yet
      expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();
    });

    it("should display video player when play button is clicked", async () => {
      const course = {
        id: 1,
        title: "Test Course",
        short_description: "This is a test course",
        thumbnail_url: "https://example.com/thumbnail.jpg",
        video_url: "https://example.com/video.mp4",
        creator: {
          full_name: "Test Instructor",
          avatar_url: "https://example.com/avatar.jpg",
        },
      };

      render(<CourseHeader course={course} onEnroll={mockEnroll} />);

      // Find the play button overlay and click it
      const playButtonOverlay = screen.getByText("", {
        selector: "div.absolute.inset-0",
      });
      fireEvent.click(playButtonOverlay);

      // Video player should now be visible
      await waitFor(() => {
        expect(screen.getByTestId("video-player")).toBeInTheDocument();
      });

      // Thumbnail should no longer be visible
      expect(screen.queryByAltText("Test Course")).not.toBeInTheDocument();
    });

    it("should not display video player or play button if no video_url", () => {
      const course = {
        id: 1,
        title: "Test Course",
        short_description: "This is a test course",
        thumbnail_url: "https://example.com/thumbnail.jpg",
        creator: {
          full_name: "Test Instructor",
          avatar_url: "https://example.com/avatar.jpg",
        },
      };

      render(<CourseHeader course={course} onEnroll={mockEnroll} />);

      // Should show thumbnail
      expect(screen.getByAltText("Test Course")).toBeInTheDocument();

      // Should not show play button overlay
      const playButtonOverlay = screen.queryByText("", {
        selector: "div.absolute.inset-0",
      });
      expect(playButtonOverlay).not.toBeInTheDocument();

      // Should not show video player
      expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();
    });
  });
});
