import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CourseForm from "@/app/components/admin/CourseForm";
import { createCourse, getAllCategories } from "@/app/lib/api/courses";
import { getAllCreators } from "@/app/lib/api/profiles";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

// Mock the API functions
jest.mock("@/app/lib/api/courses", () => ({
  createCourse: jest.fn(),
  getAllCategories: jest.fn().mockResolvedValue({
    data: [
      { id: "cat1", name: "Development" },
      { id: "cat2", name: "Business" },
    ],
    error: null,
  }),
}));

// Mock the profiles API
jest.mock("@/app/lib/api/profiles", () => ({
  getAllCreators: jest.fn().mockResolvedValue({
    data: [{ id: "creator1", full_name: "Test Creator" }],
    error: null,
  }),
}));

// Mock the router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the supabase client
jest.mock("@/app/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: "test-user-id" },
          },
        },
        error: null,
      }),
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest
          .fn()
          .mockResolvedValue({ data: { path: "test-path" }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: "https://example.com/test.jpg" },
        }),
      }),
    },
  },
}));

// Mock the AuthProvider
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: "test-user-id" },
    profile: { id: "test-profile-id", role: "admin" },
  }),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => <img {...props} alt={props.alt || ""} />,
}));

// Mock UploadBox component
jest.mock("@/app/components/UploadBox", () => {
  return function MockUploadBox({ onUploadComplete }) {
    return (
      <div data-testid="mock-upload-box">
        <button
          onClick={() =>
            onUploadComplete(
              new File(["test"], "test.jpg", { type: "image/jpeg" })
            )
          }
          data-testid="mock-upload-button"
        >
          Upload
        </button>
      </div>
    );
  };
});

describe("CourseForm Component", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  test("should handle requirements field correctly when creating a course", async () => {
    // Mock successful course creation
    createCourse.mockResolvedValue({
      data: { id: "new-course-id" },
      error: null,
    });

    // Render the component
    render(<CourseForm />);

    // Wait for the form to load with creators and categories
    await waitFor(() => {
      expect(getAllCreators).toHaveBeenCalled();
      expect(getAllCategories).toHaveBeenCalled();
    });

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText(/Course Title/i), {
      target: { value: "Test Course" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Course Description/i), {
      target: { value: "Test Description" },
    });

    // Select creator and category
    fireEvent.change(screen.getByTestId("creator-select"), {
      target: { value: "creator1" },
    });

    fireEvent.change(screen.getByTestId("category-select"), {
      target: { value: "cat1" },
    });

    // Fill in requirements
    fireEvent.change(
      screen.getByPlaceholderText(/Enter each requirement on a new line/i),
      {
        target: { value: "Requirement 1\nRequirement 2" },
      }
    );

    // Submit the form
    fireEvent.click(screen.getByText(/Create Course/i));

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(createCourse).toHaveBeenCalled();
    });

    // Check that the requirements field is correctly formatted in the API call
    expect(createCourse).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test Course",
        description: "Test Description",
        requirements_json: JSON.stringify(["Requirement 1", "Requirement 2"]),
      })
    );
  });

  test("should handle error when requirements field is not in the database schema", async () => {
    // Mock course creation with an error about the requirements field
    createCourse.mockImplementation((data) => {
      // First call returns an error
      if (data.requirements_json) {
        return Promise.resolve({
          data: null,
          error: {
            message:
              "Could not find the 'requirements' column of 'courses' in the schema cache",
          },
        });
      }

      // Second call (retry without requirements) succeeds
      return Promise.resolve({
        data: { id: "new-course-id" },
        error: null,
      });
    });

    // Render the component
    render(<CourseForm />);

    // Wait for the form to load with creators and categories
    await waitFor(() => {
      expect(getAllCreators).toHaveBeenCalled();
      expect(getAllCategories).toHaveBeenCalled();
    });

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText(/Course Title/i), {
      target: { value: "Test Course" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Course Description/i), {
      target: { value: "Test Description" },
    });

    // Select creator and category
    fireEvent.change(screen.getByTestId("creator-select"), {
      target: { value: "creator1" },
    });

    fireEvent.change(screen.getByTestId("category-select"), {
      target: { value: "cat1" },
    });

    // Fill in requirements
    fireEvent.change(
      screen.getByPlaceholderText(/Enter each requirement on a new line/i),
      {
        target: { value: "Requirement 1\nRequirement 2" },
      }
    );

    // Submit the form
    fireEvent.click(screen.getByText(/Create Course/i));

    // Wait for the form submission to complete and check that createCourse was called twice
    await waitFor(() => {
      expect(createCourse).toHaveBeenCalledTimes(2);
    });

    // Verify that the retry was called without the requirements_json field
    expect(createCourse.mock.calls[1][0]).not.toHaveProperty(
      "requirements_json"
    );
  });
});
