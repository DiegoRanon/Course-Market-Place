import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CoursesPage from "../app/courses/page";
import { expect, jest, test, describe } from "@jest/globals";

// Mock next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (param) => {
      if (param === "category") return null;
      if (param === "search") return "";
      return null;
    },
  }),
}));

// Mock supabase
jest.mock("../app/lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    then: jest.fn(),
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  },
}));

describe("Courses Page", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();

    // Setup default mock implementation
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
    };

    // Mock successful categories response
    mockSupabase
      .from()
      .select()
      .eq.mockResolvedValueOnce({
        data: [
          { category: "Web Development" },
          { category: "Data Science" },
          { category: "Web Development" },
          { category: "Design" },
        ],
        error: null,
      });

    // Mock successful courses response
    mockSupabase
      .from()
      .select()
      .eq.mockResolvedValueOnce({
        data: [
          {
            id: "1",
            title: "React Fundamentals",
            description: "Learn React from scratch",
            price: 49.99,
            category: "Web Development",
            users: { name: "John Doe" },
          },
          {
            id: "2",
            title: "Data Science Basics",
            description: "Introduction to data science",
            price: 59.99,
            category: "Data Science",
            users: { name: "Jane Smith" },
          },
        ],
        error: null,
      });

    require("../app/lib/supabase").supabase = mockSupabase;
  });

  test("renders the courses page with title", async () => {
    render(<CoursesPage />);
    expect(screen.getByText("All Courses")).toBeInTheDocument();
  });

  test("renders filters section", async () => {
    render(<CoursesPage />);
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  test("displays loading state initially", async () => {
    render(<CoursesPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
