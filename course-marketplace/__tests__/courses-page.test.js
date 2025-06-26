import { render, screen, waitFor } from '@testing-library/react';
import CoursesPage from '../app/courses/page';
import { supabase } from '../app/lib/supabase';

// Mock the Supabase client
jest.mock('../app/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    data: null,
    error: null,
  },
}));

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Courses Page', () => {
  // Sample course data for testing
  const mockCourses = [
    {
      id: 'course-1',
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      short_description: 'Start your web dev journey',
      image_url: '/images/web-dev.jpg',
      price: 49.99,
      status: 'published',
      created_at: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 'course-2',
      title: 'Advanced React Patterns',
      description: 'Master advanced React concepts and patterns',
      short_description: 'Take your React skills to the next level',
      image_url: '/images/react-advanced.jpg',
      price: 79.99,
      status: 'published',
      created_at: '2023-02-01T00:00:00.000Z',
    },
    {
      id: 'course-3',
      title: 'Introduction to HTML',
      description: 'Learn the basics of HTML markup language',
      short_description: 'Start your web development journey',
      image_url: '/images/html-basics.jpg',
      price: null, // Free course
      status: 'published',
      created_at: '2023-03-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default Supabase response
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      data: mockCourses,
      error: null,
    }));
  });

  it('renders loading state initially', async () => {
    // Override the default mock to simulate loading
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      // Don't return data immediately to simulate loading
    }));

    render(<CoursesPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders course cards with correct information', async () => {
    render(<CoursesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Introduction to Web Development')).toBeInTheDocument();
      expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
      expect(screen.getByText('Introduction to HTML')).toBeInTheDocument();
      
      expect(screen.getByText('Start your web dev journey')).toBeInTheDocument();
      expect(screen.getByText('Take your React skills to the next level')).toBeInTheDocument();
      expect(screen.getByText('Start your web development journey')).toBeInTheDocument();
      
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('$79.99')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
      
      // Check for links to course detail pages
      const links = screen.getAllByRole('link');
      expect(links[0].getAttribute('href')).toBe('/courses/course-1');
      expect(links[1].getAttribute('href')).toBe('/courses/course-2');
      expect(links[2].getAttribute('href')).toBe('/courses/course-3');
    });
  });

  it('renders empty state when no courses are found', async () => {
    // Override Supabase mock to return empty array
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      data: [],
      error: null,
    }));

    render(<CoursesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/no courses available/i)).toBeInTheDocument();
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

    render(<CoursesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading courses/i)).toBeInTheDocument();
    });
  });
}); 