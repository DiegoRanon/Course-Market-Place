import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the API modules
jest.mock("@/app/lib/api/enrollments", () => ({
  checkEnrollmentStatus: jest.fn(),
  createEnrollment: jest.fn(),
}));

// Mock the VideoPlayer component
jest.mock("@/app/components/VideoPlayer", () => {
  return function MockVideoPlayer({ videoUrl }) {
    return <div data-testid="video-player" data-url={videoUrl}>Video Player</div>;
  };
});

// Mock the AuthProvider
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock the next/router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    id: "test-course-id",
  })),
}));

// Import modules after mocking
import { checkEnrollmentStatus, createEnrollment } from "@/app/lib/api/enrollments";
import { useAuth } from "@/app/lib/AuthProvider";
import CourseDetails from "@/app/courses/[id]/page";

describe("Course Enrollment Flow", () => {
  const mockCourse = {
    id: "test-course-id",
    title: "Test Course",
    description: "This is a test course",
    video_url: "https://example.com/test-video.mp4",
    price: 0,
    requirements: "Some requirements\nMore requirements",
  };
  
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock implementation of API functions
    checkEnrollmentStatus.mockResolvedValue({ data: null, error: null });
    createEnrollment.mockResolvedValue({ data: { id: "new-enrollment-id" }, error: null });
    // Mock AuthProvider
    useAuth.mockReturnValue({ user: mockUser });
  });

  test("should display enrollment button when user is not enrolled", async () => {
    render(<CourseDetails />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(checkEnrollmentStatus).toHaveBeenCalledWith(mockUser.id, mockCourse.id);
    });
    
    // Should show the Enroll button
    expect(screen.getByText(/enroll/i)).toBeInTheDocument();
    // Should not show video player yet
    expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();
  });

  test("should show video player when user is already enrolled", async () => {
    // Mock user is already enrolled
    checkEnrollmentStatus.mockResolvedValue({ 
      data: { id: "existing-enrollment-id" }, 
      error: null 
    });
    
    render(<CourseDetails />);
    
    // Wait for video player to appear
    await waitFor(() => {
      expect(screen.getByTestId("video-player")).toBeInTheDocument();
    });
    
    // Should not show enroll button
    expect(screen.queryByText(/enroll now/i)).not.toBeInTheDocument();
  });

  test("should create enrollment and show video when enroll button is clicked", async () => {
    render(<CourseDetails />);
    
    // Find and click the enroll button
    const enrollButton = await screen.findByText(/enroll now/i);
    fireEvent.click(enrollButton);
    
    // Should call createEnrollment
    await waitFor(() => {
      expect(createEnrollment).toHaveBeenCalledWith(mockCourse.id);
    });
    
    // Should show the video player
    await waitFor(() => {
      expect(screen.getByTestId("video-player")).toBeInTheDocument();
    });
  });

  test("should redirect to login if unauthenticated user tries to enroll", async () => {
    // Mock user as not authenticated
    useAuth.mockReturnValue({ user: null });
    const mockRouter = { push: jest.fn() };
    require("next/navigation").useRouter.mockReturnValue(mockRouter);
    
    render(<CourseDetails />);
    
    // Find and click the enroll button
    const enrollButton = await screen.findByText(/enroll now/i);
    fireEvent.click(enrollButton);
    
    // Should redirect to login
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining("/login")
    );
    
    // Should not call createEnrollment
    expect(createEnrollment).not.toHaveBeenCalled();
  });

  test("should handle enrollment creation errors", async () => {
    // Mock enrollment creation to fail
    createEnrollment.mockResolvedValue({ 
      data: null, 
      error: "Failed to create enrollment" 
    });
    
    render(<CourseDetails />);
    
    // Find and click the enroll button
    const enrollButton = await screen.findByText(/enroll now/i);
    fireEvent.click(enrollButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    
    // Should not show video player
    expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();
  });
}); 