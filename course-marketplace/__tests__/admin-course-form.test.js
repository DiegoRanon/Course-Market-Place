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
          // Create a mock file
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

describe("CourseForm Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { id: "test-user-id" },
      profile: { role: "admin", id: "test-profile-id" },
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with all required fields", async () => {
    await act(async () => {
      render(<CourseForm />);
    });

    // Check for form elements
    expect(screen.getByText("Create New Course")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Course Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Course Description")).toBeInTheDocument();
    expect(screen.getByTestId("creator-select")).toBeInTheDocument();
    expect(screen.getByTestId("category-select")).toBeInTheDocument();
    expect(screen.getByTestId("thumbnail-upload-box")).toBeInTheDocument();
    expect(screen.getByTestId("video-upload-box")).toBeInTheDocument();
    expect(screen.getByText("Create Course")).toBeInTheDocument();
  });

  it("validates required fields on submit", async () => {
    await act(async () => {
      render(<CourseForm />);
    });

    // Submit without filling required fields
    await act(async () => {
      fireEvent.click(screen.getByText("Create Course"));
    });

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
      expect(screen.getByText("Creator is required")).toBeInTheDocument();
      expect(screen.getByText("Category is required")).toBeInTheDocument();
    });
  });

  it("submits the form successfully with valid data", async () => {
    const createCourseMock = require("@/app/lib/api/courses").createCourse;
    const routerMock = require("next/navigation").useRouter();
    
    await act(async () => {
      render(<CourseForm />);
    });

    // Fill in required fields
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Course Title"), {
        target: { value: "Test Course" },
      });
      fireEvent.change(screen.getByPlaceholderText("Course Description"), {
        target: { value: "Test Description" },
      });
      fireEvent.change(screen.getByTestId("creator-select"), {
        target: { value: "creator1" },
      });
      fireEvent.change(screen.getByTestId("category-select"), {
        target: { value: "cat1" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter thumbnail URL (if not uploading)"), {
        target: { value: "https://example.com/thumbnail.jpg" },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText("Create Course"));
    });

    // Check that the API was called with correct data
    await waitFor(() => {
      expect(createCourseMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Course",
          description: "Test Description",
          creator_id: "creator1",
          category_id: "cat1",
          thumbnail_url: "https://example.com/thumbnail.jpg",
        })
      );
      
      // Check success message
      expect(screen.getByText("Course created successfully! Redirecting...")).toBeInTheDocument();
    });
  });

  it("handles thumbnail and video uploads", async () => {
    // Mock the storage getPublicUrl methods for both thumbnail and video
    const { supabase } = require("@/app/lib/supabase");
    
    // Clean render with no form submission
    await act(async () => {
      render(<CourseForm />);
    });

    // Since the FileReader.readAsDataURL is being used in the real implementation
    // to create a preview, but in our test we can't really test that part,
    // we'll need to mock the setFormData call directly

    // Trigger the thumbnail upload and video upload buttons
    await act(async () => {
      fireEvent.click(screen.getByTestId("upload-thumbnail-btn"));
      fireEvent.click(screen.getByTestId("upload-video-btn"));
    });

    // Use waitFor to allow state updates to complete
    await waitFor(() => {
      // In the real app, this would be populated with the Supabase URL
      const videoInput = screen.getByPlaceholderText("Enter video URL (if not uploading)");
      expect(videoInput).toHaveValue("https://example.com/storage/test-file.jpg");
    });

    // Since we're using FileReader for thumbnail preview, the actual input might not be updated
    // This tests that the upload process works without testing the specific field value
    expect(supabase.storage.from).toHaveBeenCalledWith("course-thumbnails");
    expect(supabase.storage.from).toHaveBeenCalledWith("course-videos");
    expect(supabase.storage.from("course-thumbnails").getPublicUrl).toHaveBeenCalled();
    expect(supabase.storage.from("course-videos").getPublicUrl).toHaveBeenCalled();
  });
}); 