import { render, screen, waitFor } from '@testing-library/react';
import CreatorMyCourses from '../app/admin/courses/page';
import { useAuth } from '../app/lib/AuthProvider';
import { supabase } from '../app/lib/supabase';

// Mock the AuthProvider
jest.mock('../app/lib/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock Supabase client
jest.mock('../app/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    data: null,
    error: null,
    count: jest.fn(),
  },
}));

describe('Creator My Courses Page', () => {
  const mockUser = {
    id: 'creator-123',
    email: 'creator@example.com',
  };

  const mockProfile = {
    id: 'creator-123',
    role: 'creator',
    first_name: 'Test',
    last_name: 'Creator',
  };

  // Sample course data
  const mockCourses = [
    {
      id: 'course-1',
      title: 'React Fundamentals',
      description: 'Learn the basics of React',
      image_url: '/images/react.jpg',
      price: 49.99,
      creator_id: 'creator-123',
      created_at: '2023-01-01T00:00:00.000Z',
      enrollments: 25,
      revenue: 1249.75,
    },
    {
      id: 'course-2',
      title: 'Advanced JavaScript',
      description: 'Master advanced JavaScript concepts',
      image_url: '/images/javascript.jpg',
      price: 69.99,
      creator_id: 'creator-123',
      created_at: '2023-02-01T00:00:00.000Z',
      enrollments: 18,
      revenue: 1259.82,
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default auth state
    useAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      loading: false,
    });

    // Default Supabase response
    supabase.from.mockImplementation((table) => {
      if (table === 'courses') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          data: mockCourses,
          error: null,
        };
      }
      
      if (table === 'enrollments') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockImplementation((field, value) => {
            // Return different counts based on course_id
            if (value === 'course-1') {
              return {
                count: 25,
                error: null
              };
            } else {
              return {
                count: 18,
                error: null
              };
            }
          }),
          error: null,
        };
      }
      
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        data: [],
        error: null,
      };
    });
  });

  it('renders loading state while fetching courses', async () => {
    // Override the default mock to simulate loading
    useAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      loading: true,
    });

    render(<CreatorMyCourses />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders empty state when creator has no courses', async () => {
    // Override Supabase mock to return empty array
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      data: [],
      error: null,
    }));

    render(<CreatorMyCourses />);
    
    await waitFor(() => {
      expect(screen.getByText(/You don't have any courses yet/i)).toBeInTheDocument();
    });
  });

  it('renders course cards with analytics', async () => {
    render(<CreatorMyCourses />);
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Advanced JavaScript')).toBeInTheDocument();
      
      // Use container queries to find specific elements by their context
      const courseElements = screen.getAllByRole('heading', { level: 3 });
      
      // First course
      const firstCourseHeading = courseElements.find(el => el.textContent === 'React Fundamentals');
      const firstCourseCard = firstCourseHeading.closest('div.bg-white');
      expect(firstCourseCard).toBeInTheDocument();
      
      // Second course
      const secondCourseHeading = courseElements.find(el => el.textContent === 'Advanced JavaScript');
      const secondCourseCard = secondCourseHeading.closest('div.bg-white');
      expect(secondCourseCard).toBeInTheDocument();
      
      // Check that numbers are formatted correctly
      expect(screen.getByText('$1,249.75')).toBeInTheDocument();
      expect(screen.getByText('$1,259.82')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Override Supabase mock to simulate an error
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      data: null,
      error: { message: 'Failed to fetch courses' },
    }));

    render(<CreatorMyCourses />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading your courses/i)).toBeInTheDocument();
    });
  });

  it('restricts access to creators only', async () => {
    // Override auth mock to simulate non-creator user
    useAuth.mockReturnValue({
      user: mockUser,
      profile: { ...mockProfile, role: 'student' },
      loading: false,
    });

    render(<CreatorMyCourses />);
    
    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
  });
}); 