import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore a specific log level during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock window.location for auth tests
Object.defineProperty(window, "location", {
  value: {
    origin: "http://localhost:3000",
    href: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
});

// Mock fetch for any external API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock crypto for UUID generation
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "test-uuid-123",
  },
});

// Mock Date for consistent timestamps
const mockDate = new Date("2024-01-01T00:00:00.000Z");
global.Date = jest.fn(() => mockDate);
global.Date.now = jest.fn(() => mockDate.getTime());

// Test timeout configuration
jest.setTimeout(10000);

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Global test data helpers
global.createMockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  user_metadata: {
    first_name: "John",
    last_name: "Doe",
  },
  ...overrides,
});

global.createMockProfile = (overrides = {}) => ({
  id: "user-123",
  first_name: "John",
  last_name: "Doe",
  full_name: "John Doe",
  bio: "Test bio",
  role: "student",
  status: "active",
  avatar_url: "https://example.com/avatar.jpg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

global.createMockCourse = (overrides = {}) => ({
  id: "course-123",
  title: "Test Course",
  slug: "test-course",
  description: "Test course description",
  short_description: "Test short description",
  thumbnail_url: "https://example.com/thumbnail.jpg",
  price: 99.99,
  original_price: 149.99,
  category_id: "category-123",
  instructor_id: "instructor-123",
  status: "published",
  difficulty: "beginner",
  duration_hours: 10,
  total_lessons: 20,
  rating: 4.5,
  total_ratings: 100,
  total_students: 500,
  featured: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

global.createMockCategory = (overrides = {}) => ({
  id: "category-123",
  name: "Programming",
  slug: "programming",
  description: "Programming courses",
  color: "#ff0000",
  created_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

global.createMockLesson = (overrides = {}) => ({
  id: "lesson-123",
  course_id: "course-123",
  title: "Test Lesson",
  description: "Test lesson description",
  video_url: "https://example.com/video.mp4",
  video_duration: 1800,
  position: 1,
  is_free: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

global.createMockEnrollment = (overrides = {}) => ({
  id: "enrollment-123",
  user_id: "user-123",
  course_id: "course-123",
  enrolled_at: "2024-01-01T00:00:00Z",
  completed_at: null,
  progress_percentage: 0,
  ...overrides,
});

global.createMockProgress = (overrides = {}) => ({
  id: "progress-123",
  user_id: "user-123",
  lesson_id: "lesson-123",
  course_id: "course-123",
  completed: false,
  watched_duration: 0,
  completed_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

global.createMockReview = (overrides = {}) => ({
  id: "review-123",
  user_id: "user-123",
  course_id: "course-123",
  rating: 5,
  comment: "Great course!",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

global.createMockSession = (overrides = {}) => ({
  access_token: "test-access-token",
  refresh_token: "test-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: createMockUser(),
  ...overrides,
});
