import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import CourseForm from "@/app/components/admin/CourseForm";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createCourse, updateCourse } from "@/app/lib/api/courses";
import { supabase } from "@/app/lib/supabase";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock supabase client
jest.mock("@supabase/supabase-js", () => {
  const mockStorageFrom = {
    upload: jest
      .fn()
      .mockResolvedValue({ data: { path: "test-video.mp4" }, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({
      data: { publicUrl: "https://example.com/test-video.mp4" },
    }),
  };

  const mockStorage = {
    from: jest.fn().mockReturnValue(mockStorageFrom),
  };

  const mockSupabase = {
    storage: mockStorage,
    from: jest.fn().mockImplementation((table) => ({
      insert: jest.fn().mockResolvedValue({ data: { id: "123" }, error: null }),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "test-token",
            user: { id: "test-user-id" },
          },
        },
        error: null,
      }),
    },
  };

  return {
    createClient: jest.fn().mockReturnValue(mockSupabase),
  };
});

// Mock AuthProvider
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: "admin-user-id" },
    profile: { id: "admin-profile-id", role: "admin" },
  }),
}));

// Mock API functions
jest.mock("@/app/lib/api/courses", () => ({
  getAllCategories: jest.fn().mockResolvedValue({
    data: [{ id: "1", name: "Test Category" }],
    error: null,
  }),
  createCourse: jest
    .fn()
    .mockResolvedValue({ data: { id: "123" }, error: null }),
  updateCourse: jest.fn(),
}));

jest.mock("@/app/lib/api/profiles", () => ({
  getAllCreators: jest.fn().mockResolvedValue({
    data: [{ id: "1", full_name: "Test Creator" }],
    error: null,
  }),
}));

// Mock the supabase client
jest.mock("@/app/lib/supabase", () => {
  // Create mock functions for different bucket types
  const mockBuckets = {
    "course-videos": {
      upload: jest.fn().mockResolvedValue({
        data: { path: "course-videos/test-video.mp4" },
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: {
          publicUrl:
            "https://test-bucket.supabase.co/storage/v1/object/public/course-videos/test-video.mp4",
        },
      }),
    },
    "course-thumbnails": {
      upload: jest.fn().mockResolvedValue({
        data: { path: "course-thumbnails/test-image.jpg" },
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: {
          publicUrl:
            "https://test-bucket.supabase.co/storage/v1/object/public/course-thumbnails/test-image.jpg",
        },
      }),
    },
  };

  // Create a mock function for from that returns the appropriate bucket
  const fromMock = jest.fn().mockImplementation((bucket) => {
    return mockBuckets[bucket] || mockBuckets["course-thumbnails"];
  });

  return {
    supabase: {
      storage: {
        from: fromMock,
      },
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: "test-user-id" } } },
          error: null,
        }),
      },
    },
  };
});

// Mock the useAuth hook
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: "test-user-id" },
    profile: { id: "test-profile-id", role: "admin" },
  }),
}));

describe("CourseForm Video Upload", () => {
  let mockRouter;
  let mockCreateCourse;

  beforeEach(() => {
    mockRouter = { push: jest.fn() };
    useRouter.mockReturnValue(mockRouter);

    // Create a spy on the createCourse function
    const { createCourse } = require("@/app/lib/api/courses");
    mockCreateCourse = jest.fn().mockImplementation(createCourse);
    require("@/app/lib/api/courses").createCourse = mockCreateCourse;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle video upload without RLS policy violations", async () => {
    // Render the component
    await act(async () => {
      render(<CourseForm />);
    });

    // Fill in required form fields
    fireEvent.change(screen.getByPlaceholderText(/course title/i), {
      target: { value: "Test Course" },
    });

    fireEvent.change(screen.getByPlaceholderText(/course description/i), {
      target: { value: "Test Description" },
    });

    // Select creator and category
    fireEvent.change(screen.getByTestId("creator-select"), {
      target: { value: "1" },
    });

    fireEvent.change(screen.getByTestId("category-select"), {
      target: { value: "1" },
    });

    // Mock file upload for video
    const videoFile = new File(["dummy video content"], "test-video.mp4", {
      type: "video/mp4",
    });
    const fileInputs = screen.getAllByTestId("file-input");
    const videoInput = fileInputs[1]; // Second file input is for video

    Object.defineProperty(videoInput, "files", {
      value: [videoFile],
    });

    fireEvent.change(videoInput);

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText(/create course/i));
    });

    // Verify the course was created with video
    await waitFor(() => {
      expect(
        screen.getByText(/course created successfully/i)
      ).toBeInTheDocument();
    });
  });

  test("should handle RLS policy error gracefully for video upload", async () => {
    // Mock RLS policy violation error
    mockCreateCourse.mockResolvedValueOnce({
      data: null,
      error: { message: "new row violates row-level security policy" },
    });

    // Render the component
    await act(async () => {
      render(<CourseForm />);
    });

    // Fill in required form fields
    fireEvent.change(screen.getByPlaceholderText(/course title/i), {
      target: { value: "Test Course" },
    });

    fireEvent.change(screen.getByPlaceholderText(/course description/i), {
      target: { value: "Test Description" },
    });

    // Select creator and category
    fireEvent.change(screen.getByTestId("creator-select"), {
      target: { value: "1" },
    });

    fireEvent.change(screen.getByTestId("category-select"), {
      target: { value: "1" },
    });

    // Mock file upload for video
    const videoFile = new File(["dummy video content"], "test-video.mp4", {
      type: "video/mp4",
    });
    const fileInputs = screen.getAllByTestId("file-input");
    const videoInput = fileInputs[1]; // Second file input is for video

    Object.defineProperty(videoInput, "files", {
      value: [videoFile],
    });

    fireEvent.change(videoInput);

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText(/create course/i));
    });

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test("should correctly assign video URL when uploading a video", async () => {
    // Mock successful course creation
    createCourse.mockImplementation((data) => {
      // Check that the video_url is included in the data
      expect(data).toHaveProperty("video_url");
      expect(data.video_url).toBe(
        "https://test-bucket.supabase.co/storage/v1/object/public/course-videos/test-video.mp4"
      );

      return Promise.resolve({
        data: { id: "new-course-id" },
        error: null,
      });
    });

    // Render the component
    render(<CourseForm />);

    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByText(/title/i)).toBeInTheDocument();
    });

    // Fill in required fields
    const titleInput = screen.getByPlaceholderText(/course title/i);
    fireEvent.change(titleInput, { target: { value: "Test Course" } });

    const descriptionInput = screen.getByPlaceholderText(/course description/i);
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });

    // Select creator and category
    const creatorSelect = screen.getByTestId("creator-select");
    fireEvent.change(creatorSelect, { target: { value: "creator1" } });

    const categorySelect = screen.getByTestId("category-select");
    fireEvent.change(categorySelect, { target: { value: "cat1" } });

    // Create mock files
    const thumbnailFile = new File(["dummy content"], "test-image.jpg", {
      type: "image/jpeg",
    });
    const videoFile = new File(["video content"], "test-video.mp4", {
      type: "video/mp4",
    });

    // Simulate file uploads
    const fileInputs = screen.getAllByTestId("file-input");
    const thumbnailInput = fileInputs[0]; // First file input is for thumbnail
    const videoInput = fileInputs[1]; // Second file input is for video

    fireEvent.change(thumbnailInput, { target: { files: [thumbnailFile] } });
    fireEvent.change(videoInput, { target: { files: [videoFile] } });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /create course/i });
    fireEvent.click(submitButton);

    // Wait for form submission to complete
    await waitFor(() => {
      // Check that createCourse was called
      expect(createCourse).toHaveBeenCalled();
    });
  });
});
