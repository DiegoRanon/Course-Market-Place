import { render, screen, waitFor } from '@testing-library/react';
import CreatorMyCourses from '../app/admin/courses/page';
import { useAuth } from '../app/lib/AuthProvider';
import { supabase } from '../app/lib/supabase';

// Mock the auth hook
jest.mock('../app/lib/AuthProvider', () => ({
  useAuth: jest.fn()
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />
}));

// Mock Supabase client
jest.mock('../app/lib/supabase', () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  const mockFrom = jest.fn(() => ({
    select: mockSelect,
    eq: mockEq,
    order: mockOrder
  }));

  return {
    supabase: {
      from: mockFrom
    }
  };
});

describe('CreatorMyCourses Page (Admin View)', () => {
  const mockAdmin = {
    id: 'admin-123',
    role: 'admin'
  };

  const mockCourses = [
    {
      id: 1,
      title: 'Test Course 1',
      description: 'Description 1',
      admin_id: 'admin-123',
      image_url: '/test1.jpg',
      price: 99.99
    },
    {
      id: 2,
      title: 'Test Course 2',
      description: 'Description 2',
      admin_id: 'admin-123',
      image_url: '/test2.jpg',
      price: 149.99
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default auth mock
    useAuth.mockReturnValue({
      user: { id: 'admin-123' },
      profile: mockAdmin,
      loading: false
    });

    // Setup default Supabase responses
    const mockFrom = supabase.from;
    mockFrom.mockImplementation((table) => {
      if (table === 'enrollments') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          head: jest.fn().mockResolvedValue({ count: 5, error: null })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCourses, error: null })
      };
    });
  });

  it('should show loading state initially', () => {
    useAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true
    });

    render(<CreatorMyCourses />);
    expect(screen.getByText('Loading your courses...')).toBeInTheDocument();
  });

  it('should show access denied for non-admin users', () => {
    useAuth.mockReturnValue({
      user: { id: 'user-123' },
      profile: { id: 'user-123', role: 'user' },
      loading: false
    });

    render(<CreatorMyCourses />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You need admin permissions to access this page.')).toBeInTheDocument();
  });

  it('should display admin courses correctly', async () => {
    // Setup mock response for courses
    const mockFrom = supabase.from;
    mockFrom.mockImplementation((table) => {
      if (table === 'enrollments') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          head: jest.fn().mockResolvedValue({ count: 5, error: null })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCourses, error: null })
      };
    });

    render(<CreatorMyCourses />);

    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
      expect(screen.getByText('Test Course 2')).toBeInTheDocument();
    });

    // Verify Supabase was called correctly
    expect(mockFrom).toHaveBeenCalledWith('courses');
  });

  it('should show empty state when no courses exist', async () => {
    // Setup mock response for empty courses
    const mockFrom = supabase.from;
    mockFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    }));

    render(<CreatorMyCourses />);

    await waitFor(() => {
      expect(screen.getByText('You dont have any courses yet')).toBeInTheDocument();
      expect(screen.getByText('No courses are currently assigned to you.')).toBeInTheDocument();
    });
  });

  it('should show error state when API fails', async () => {
    // Setup mock response for API error
    const mockFrom = supabase.from;
    mockFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: new Error('API Error') })
    }));

    render(<CreatorMyCourses />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('There was an error loading your courses. Please try again later.')).toBeInTheDocument();
    });
  });
}); 