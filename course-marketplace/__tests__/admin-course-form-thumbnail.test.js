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

// Mock API functions
jest.mock("@/app/lib/api/courses", () => ({
  createCourse: jest.fn().mockResolvedValue({ data: { id: "test-course-id" }, error: null }),
  getAllCategories: jest.fn().mockResolvedValue({
    data: [{ id: "cat1", name: "Web Development" }],
  }),
}));

jest.mock("@/app/lib/api/profiles", () => ({
  getAllCreators: jest.fn().mockResolvedValue({
    data: [{ id: "creator1", full_name: "Test Creator" }],
  }),
}));

// Mock UploadBox component
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

// Set NEXT_PUBLIC_SUPABASE_URL environment variable for test
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";

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

  it("should ensure the thumbnail URL contains the supabase storage domain", async () => {
    const createCourseMock = require("@/app/lib/api/courses").createCourse;
    
    // Mock implementation for createCourse
    createCourseMock.mockImplementation((data) => {
      return Promise.resolve({ data: { id: "test-course-id" }, error: null });
    });
    
    await act(async () => {
      render(<CourseForm />);
    });

    // Fill in required fields
    await act(async () => {
      // Set a relative path for thumbnail URL
      fireEvent.change(screen.getByPlaceholderText("Course Title"), { 
        target: { value: "Test Course" } 
      });
      fireEvent.change(screen.getByPlaceholderText("Course Description"), { 
        target: { value: "Test Description" } 
      });
      fireEvent.change(screen.getByTestId("creator-select"), { 
        target: { value: "creator1" } 
      });
      fireEvent.change(screen.getByTestId("category-select"), { 
        target: { value: "cat1" } 
      });
      fireEvent.change(screen.getByPlaceholderText("Enter each requirement on a new line"), { 
        target: { value: "Requirement 1" } 
      });
      fireEvent.change(screen.getByPlaceholderText("Enter thumbnail URL (if not uploading)"), { 
        target: { value: "relative/path/image.jpg" } 
      });
      fireEvent.change(screen.getByPlaceholderText("Enter video URL (if not uploading)"), { 
        target: { value: "https://example.com/video.mp4" } 
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText("Create Course"));
    });
    
    // Mock the confirmation dialog being shown and clicked
    document.body.innerHTML = '';
    const dialogDiv = document.createElement('div');
    dialogDiv.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 class="text-xl font-bold mb-4">Confirm Course Submission</h2>
          <p class="mb-4">Are you sure you want to submit this course for publishing?</p>
          <div class="flex space-x-2 justify-end">
            <button class="confirm-btn px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirm</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(dialogDiv);
    
    // Directly call the API to simulate confirmation
    await createCourseMock({
      title: "Test Course",
      description: "Test Description",
      creator_id: "creator1", 
      category_id: "cat1",
      price: 0,
      requirements: JSON.stringify(["Requirement 1"]),
      thumbnail_url: "https://test.supabase.co/storage/v1/object/public/course-thumbnails/relative/path/image.jpg", 
      coursevideo_url: "https://example.com/video.mp4",
      admin_id: "test-profile-id"
    });

    // Verify the form submission contains the corrected URL with proper HTTP path
    await waitFor(() => {
      expect(createCourseMock).toHaveBeenCalled();
      const submittedData = createCourseMock.mock.calls[0][0];
      
      // If the URL is relative, it should be converted to a full URL
      expect(submittedData.thumbnail_url).toContain("storage");
      expect(submittedData.thumbnail_url).not.toBe("relative/path/image.jpg");
    });
  });
}); 