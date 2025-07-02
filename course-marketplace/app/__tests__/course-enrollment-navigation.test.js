import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import CourseCard from '../components/CourseCard';
import { checkEnrollmentStatus } from '../lib/api/enrollments';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the enrollment check function
jest.mock('../lib/api/enrollments', () => ({
  checkEnrollmentStatus: jest.fn(),
}));

// Mock Auth context
jest.mock('../lib/AuthProvider', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id' },
    loading: false,
  })),
}));

describe('Course Enrollment Navigation', () => {
  const mockCourse = {
    id: 'course-123',
    title: 'Test Course',
    description: 'A test course description',
    thumbnail_url: '/test-image.jpg',
  };
  
  const mockRouter = {
    push: jest.fn(),
  };
  
  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter);
    mockRouter.push.mockReset();
    checkEnrollmentStatus.mockReset();
  });
  
  test('should navigate to course details page if user is not enrolled', async () => {
    // Mock enrollment check to return no enrollment
    checkEnrollmentStatus.mockResolvedValue({ data: null, error: null });
    
    render(<CourseCard course={mockCourse} />);
    
    const courseCard = screen.getByText('Test Course').closest('div');
    fireEvent.click(courseCard);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/courses/${mockCourse.id}`);
    });
  });
  
  test('should navigate to learning page if user is enrolled', async () => {
    // Mock enrollment check to return enrollment data
    checkEnrollmentStatus.mockResolvedValue({ 
      data: { id: 'enrollment-123' }, 
      error: null 
    });
    
    render(<CourseCard course={mockCourse} />);
    
    const courseCard = screen.getByText('Test Course').closest('div');
    fireEvent.click(courseCard);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/learn/${mockCourse.id}`);
    });
  });
  
  test('should navigate to course details if enrollment check fails', async () => {
    // Mock enrollment check to return an error
    checkEnrollmentStatus.mockResolvedValue({ 
      data: null, 
      error: { message: 'Failed to check enrollment' } 
    });
    
    render(<CourseCard course={mockCourse} />);
    
    const courseCard = screen.getByText('Test Course').closest('div');
    fireEvent.click(courseCard);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/courses/${mockCourse.id}`);
    });
  });
}); 