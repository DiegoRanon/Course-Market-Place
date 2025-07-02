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
      .mockResolvedValue({ data: { path: "test-thumbnail.jpg" }, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({
      data: { publicUrl: "https://example.com/test-thumbnail.jpg" },
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
          session: { access_token: "test-token", user: { id: "test-user-id" } },
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
  // Create a mock function for getPublicUrl that returns the correct URL
  const getPublicUrlMock = jest.fn().mockReturnValue({
    data: {
      publicUrl:
        "https://test-bucket.supabase.co/storage/v1/object/public/course-thumbnails/test-image.jpg",
    },
  });

  // Create a mock function for upload that resolves successfully
  const uploadMock = jest.fn().mockResolvedValue({
    data: { path: "course-thumbnails/test-image.jpg" },
    error: null,
  });

  // Create a mock function for from that returns the upload and getPublicUrl mocks
  const fromMock = jest.fn().mockReturnValue({
    upload: uploadMock,
    getPublicUrl: getPublicUrlMock,
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

describe("CourseForm Thumbnail Upload", () => {
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

  test("should handle thumbnail upload without RLS policy violations", async () => {
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

    // Select creator and category using name attribute
    fireEvent.change(screen.getByTestId("creator-select"), {
      target: { value: "1" },
    });

    fireEvent.change(screen.getByTestId("category-select"), {
      target: { value: "1" },
    });

    // Mock file upload for thumbnail
    const file = new File(["dummy content"], "thumbnail.png", {
      type: "image/png",
    });
    const fileInputs = screen.getAllByTestId("file-input");
    const thumbnailInput = fileInputs[0]; // First file input is for thumbnail

    Object.defineProperty(thumbnailInput, "files", {
      value: [file],
    });

    fireEvent.change(thumbnailInput);

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText(/create course/i));
    });

    // Verify the course was created with thumbnail
    await waitFor(() => {
      expect(
        screen.getByText(/course created successfully/i)
      ).toBeInTheDocument();
    });
  });

  test("should handle RLS policy error gracefully", async () => {
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

    // Select creator and category using name attribute
    fireEvent.change(screen.getByTestId("creator-select"), {
      target: { value: "1" },
    });

    fireEvent.change(screen.getByTestId("category-select"), {
      target: { value: "1" },
    });

    // Mock file upload for thumbnail
    const file = new File(["dummy content"], "thumbnail.png", {
      type: "image/png",
    });
    const fileInputs = screen.getAllByTestId("file-input");
    const thumbnailInput = fileInputs[0]; // First file input is for thumbnail

    Object.defineProperty(thumbnailInput, "files", {
      value: [file],
    });

    fireEvent.change(thumbnailInput);

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText(/create course/i));
    });

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test("should correctly assign thumbnail URL when uploading a thumbnail", async () => {
    // Mock successful course creation
    createCourse.mockImplementation((data) => {
      // Check that the thumbnail_url is included in the data
      expect(data).toHaveProperty("thumbnail_url");
      expect(data.thumbnail_url).toBe(
        "https://test-bucket.supabase.co/storage/v1/object/public/course-thumbnails/test-image.jpg"
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

    // Create a mock file
    const file = new File(["dummy content"], "test-image.jpg", {
      type: "image/jpeg",
    });

    // Simulate file upload
    const fileInput = screen.getAllByTestId("file-input")[0]; // First file input is for thumbnail
    fireEvent.change(fileInput, { target: { files: [file] } });

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
