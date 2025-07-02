import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import CourseForm from "@/app/components/admin/CourseForm";
import { useRouter } from "next/navigation";
import * as courses from "@/app/lib/api/courses";
import * as profiles from "@/app/lib/api/profiles";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

// Mock AuthProvider
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: "admin-user-id" },
    profile: { id: "admin-profile-id", role: "admin" },
  }),
}));

// Mock API functions
jest.mock("@/app/lib/api/courses", () => ({
  createCourse: jest.fn().mockImplementation((data) => {
    return Promise.resolve({
      data: { id: "new-course-id" },
      error: null
    });
  }),
  getAllCategories: jest.fn().mockResolvedValue({
    data: [{ id: "1", name: "Category 1" }],
    error: null,
  }),
}));

jest.mock("@/app/lib/api/profiles", () => ({
  getAllCreators: jest.fn().mockResolvedValue({
    data: [{ id: "1", full_name: "Creator 1" }],
    error: null,
  }),
}));

// Mock supabase
jest.mock("@/app/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "test-token" } },
        error: null,
      }),
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: "test-path" },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: "https://test-bucket.supabase.co/storage/v1/object/public/test-path" },
        }),
      }),
    },
  },
}));

describe("CourseForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates course with thumbnail_url and courseVideo_url fields", async () => {
    // Spy on createCourse to check the arguments
    const createCourseSpy = jest.spyOn(courses, "createCourse");
    
    render(<CourseForm />);

    // Fill in required form fields
    fireEvent.change(screen.getByPlaceholderText(/course title/i), {
      target: { value: "Test Course" },
    });
    
    fireEvent.change(screen.getByPlaceholderText(/course description/i), {
      target: { value: "This is a test course description" },
    });
    
    // Fill in the URL fields directly
    fireEvent.change(screen.getByPlaceholderText(/enter thumbnail url/i), {
      target: { value: "https://example.com/thumbnail.jpg" },
    });
    
    fireEvent.change(screen.getByPlaceholderText(/enter video url/i), {
      target: { value: "https://example.com/video.mp4" },
    });

    // Wait for select options to be available
    await waitFor(() => {
      fireEvent.change(screen.getByTestId("creator-select"), {
        target: { value: "1" },
      });
      
      fireEvent.change(screen.getByTestId("category-select"), {
        target: { value: "1" },
      });
    });

    // Submit the form
    fireEvent.submit(screen.getByText(/create course/i));

    // Wait for the API call to be made
    await waitFor(() => {
      expect(createCourseSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          thumbnail_url: "https://example.com/thumbnail.jpg",
          courseVideo_url: "https://example.com/video.mp4",
        })
      );
    });
  });
}); 