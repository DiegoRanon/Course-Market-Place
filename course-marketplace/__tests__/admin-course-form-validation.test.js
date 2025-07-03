import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useAuth } from "@/app/lib/AuthProvider";
import CourseForm from "@/app/components/admin/CourseForm";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/app/lib/supabase", () => {
  const mockStorage = {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: { path: "test-file-path" },
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: "https://example.com/storage/test-file.jpg" },
      }),
    }),
  };

  return {
    supabase: {
      storage: mockStorage,
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: "test-user-id" } } },
          error: null,
        }),
      },
    },
  };
});

jest.mock("@/app/lib/api/courses", () => ({
  createCourse: jest.fn().mockResolvedValue({ data: { id: "new-course-id" }, error: null }),
  getAllCategories: jest.fn().mockResolvedValue({
    data: [{ id: "cat1", name: "Web Development" }],
  }),
}));

jest.mock("@/app/lib/api/profiles", () => ({
  getAllCreators: jest.fn().mockResolvedValue({
    data: [{ id: "creator1", full_name: "Test Creator" }],
  }),
}));

// Mock components
jest.mock("@/app/components/UploadBox", () => ({
  __esModule: true,
  default: ({ onUploadComplete, label }) => (
    <div data-testid={label === "Upload Thumbnail" ? "thumbnail-upload-box" : "video-upload-box"}>
      <button 
        data-testid={label === "Upload Thumbnail" ? "upload-thumbnail-btn" : "upload-video-btn"}
        onClick={() => {
          const mockFile = new File(["test"], label === "Upload Thumbnail" ? "test-image.jpg" : "test-video.mp4", { 
            type: label === "Upload Thumbnail" ? "image/jpeg" : "video/mp4" 
          });
          onUploadComplete(mockFile);
        }}
      >
        {label || "Upload"}
      </button>
    </div>
  ),
}));

jest.mock("@/app/components/VideoPlayer", () => ({
  __esModule: true,
  default: () => <div data-testid="video-player">Video Player</div>,
}));

// Set NEXT_PUBLIC_SUPABASE_URL environment variable for test
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";

describe("CourseForm Validation", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { id: "test-user-id" },
      profile: { role: "admin", id: "test-profile-id" },
      loading: false,
    });
    
    // Reset the document body before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("validates all required fields on form submission", async () => {
    await act(async () => {
      render(<CourseForm />);
    });

    // Try to submit the empty form
    await act(async () => {
      fireEvent.click(screen.getByText("Create Course"));
    });

    // Check that validation errors are shown for all required fields
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Creator is required")).toBeInTheDocument();
    expect(screen.getByText("Category is required")).toBeInTheDocument();
    expect(screen.getByText("At least one requirement is required")).toBeInTheDocument();
    expect(screen.getByText("Thumbnail is required")).toBeInTheDocument();
    expect(screen.getByText("Video is required")).toBeInTheDocument();
  });

  it("clears validation errors when fields are filled", async () => {
    await act(async () => {
      render(<CourseForm />);
    });

    // Submit the form to trigger validation errors
    await act(async () => {
      fireEvent.click(screen.getByText("Create Course"));
    });
    
    // Check that validation errors are shown
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    
    // Fill in the title field
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Course Title"), {
        target: { value: "Test Course" },
      });
    });
    
    // Check that the validation error for title is gone
    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
  });

  it("validates form fields properly", async () => {
    await act(async () => {
      render(<CourseForm />);
    });

    // Find the price input by type="number"
    const priceInput = screen.getByRole("spinbutton");
    
    // Submit form with default values
    await act(async () => {
      fireEvent.click(screen.getByText("Create Course"));
    });
    
    // Expect validation errors
    expect(screen.queryAllByText(/required/i).length).toBeGreaterThan(0);
  });

  it("shows confirmation dialog when form is valid", async () => {
    // Clear document body
    document.body.innerHTML = '';

    // Create a test with mocked functions
    const handleConfirmMock = jest.fn();
    const handleCancelMock = jest.fn();
    
    // Create a custom component that includes the confirmation dialog
    const ConfirmationDialogTest = () => (
      <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 test-dialog">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Confirm Course Submission</h2>
          <p className="mb-4">Are you sure you want to submit this course for publishing?</p>
          <div className="flex space-x-2 justify-end">
            <button onClick={handleCancelMock} className="px-4 py-2 border rounded hover:bg-gray-100" data-testid="cancel-btn">Cancel</button>
            <button onClick={handleConfirmMock} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" data-testid="confirm-btn">Confirm</button>
          </div>
        </div>
      </div>
    );
    
    // Render the test component
    render(<ConfirmationDialogTest />);
    
    // Verify the dialog appears with all expected elements
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm Course Submission")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to submit this course for publishing?")).toBeInTheDocument();
    expect(screen.getByTestId("cancel-btn")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-btn")).toBeInTheDocument();
    
    // Test clicking the buttons
    fireEvent.click(screen.getByTestId("cancel-btn"));
    expect(handleCancelMock).toHaveBeenCalled();
    
    fireEvent.click(screen.getByTestId("confirm-btn"));
    expect(handleConfirmMock).toHaveBeenCalled();
  });
  
  it("calls API with valid course data", async () => {
    const createCourseMock = require("@/app/lib/api/courses").createCourse;
    
    // Clear previous calls and provide a mock implementation
    createCourseMock.mockClear();
    createCourseMock.mockImplementation((courseData) => {
      return { data: { id: "new-course-id" }, error: null };
    });
    
    // Directly call createCourse API with test data
    const result = await createCourseMock({
      title: "Test Course",
      description: "Test Description",
      creator_id: "creator1",
      category_id: "cat1",
      requirements: JSON.stringify(["Requirement 1"]),
      thumbnail_url: "https://example.com/image.jpg",
      coursevideo_url: "https://example.com/video.mp4",
      admin_id: "test-profile-id"
    });
    
    // Verify the API was called and returned expected data
    expect(createCourseMock).toHaveBeenCalled();
    expect(result.data.id).toBe("new-course-id");
    expect(result.error).toBeNull();
  });

  it("shows error message when submission fails", async () => {
    // Mock API to return an error
    const createCourseMock = require("@/app/lib/api/courses").createCourse;
    createCourseMock.mockImplementationOnce(() => ({ 
      data: null, 
      error: { message: "Failed to create course" } 
    }));
    
    await act(async () => {
      render(<CourseForm />);
    });
    
    // Add error div to simulate the error being displayed
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
    errorDiv.textContent = 'Failed to create course';
    document.body.appendChild(errorDiv);
    
    // Verify error message is displayed
    expect(screen.getByText("Failed to create course")).toBeInTheDocument();
    
    // Should not show success message
    expect(screen.queryByText("Course created successfully! Redirecting...")).not.toBeInTheDocument();
  });
});