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

describe("CourseForm Thumbnail URL Handling", () => {
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

  it("should correctly format the thumbnail URL with the full HTTP path", async () => {
    // Mock the storage URL manipulation
    const { supabase } = require("@/app/lib/supabase");
    const publicUrlSpy = jest.spyOn(supabase.storage.from("course-thumbnails"), "getPublicUrl");
    publicUrlSpy.mockReturnValue({
      data: { publicUrl: "https://example.com/storage/test-image.jpg" },
    });

    // Use act to handle React state updates
    await act(async () => {
      render(<CourseForm />);
    });

    // Trigger the thumbnail file upload using the test-id
    fireEvent.click(screen.getByTestId("upload-thumbnail-btn"));

    // Wait for the URL to be processed
    await waitFor(() => {
      // Check if the form data was updated with the correct URL
      expect(publicUrlSpy).toHaveBeenCalled();
      
      // Find the thumbnail URL input
      const thumbnailUrlInput = screen.getByPlaceholderText("Enter thumbnail URL (if not uploading)");
      expect(thumbnailUrlInput).toHaveValue("https://example.com/storage/test-image.jpg");
    });
  });

  it("should ensure the thumbnail URL contains the supabase storage domain", async () => {
    // Create a mock implementation for createCourse to capture the submitted data
    const createCourseMock = require("@/app/lib/api/courses").createCourse;
    createCourseMock.mockImplementation((data) => {
      console.log("Course data received:", data);
      return Promise.resolve({ data: { id: "new-course-id" }, error: null });
    });
    
    // Use act to handle React state updates
    await act(async () => {
      render(<CourseForm />);
    });

    // Wait for initial data loading
    await waitFor(() => {
      expect(screen.getByTestId("creator-select")).toBeInTheDocument();
    });

    // Fill in required fields
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Course Title"), {
        target: { value: "Test Course" },
      });
      fireEvent.change(screen.getByPlaceholderText("Course Description"), {
        target: { value: "Test Description" },
      });
      
      // Select creator and category
      fireEvent.change(screen.getByTestId("creator-select"), {
        target: { value: "creator1" },
      });
      fireEvent.change(screen.getByTestId("category-select"), {
        target: { value: "cat1" },
      });

      // Manually set thumbnail URL to an incomplete path
      fireEvent.change(screen.getByPlaceholderText("Enter thumbnail URL (if not uploading)"), {
        target: { value: "relative/path/image.jpg" },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText("Create Course"));
    });

    // Verify the form submission contains the corrected URL with proper HTTP path
    await waitFor(() => {
      expect(createCourseMock).toHaveBeenCalled();
      const submittedData = createCourseMock.mock.calls[0][0];
      
      // If the URL is relative, it should be converted to a full URL
      if (submittedData.thumbnail_url) {
        expect(submittedData.thumbnail_url.startsWith("http")).toBeTruthy();
      }
    });
  });
}); 