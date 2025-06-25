import { getCourses, getCategories, enrollInCourse } from "../lib/database";

// Mock Supabase
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Import the mocked supabase
import { supabase } from "../lib/supabase";

describe("Database Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Course Operations", () => {
    test("getCourses should fetch published courses", async () => {
      const mockCourses = [
        {
          id: "course-1",
          title: "React Fundamentals",
          status: "published",
        },
        {
          id: "course-2",
          title: "Node.js Backend",
          status: "published",
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCourses, error: null }),
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await getCourses();

      expect(supabase.from).toHaveBeenCalledWith("courses");
      expect(mockQuery.eq).toHaveBeenCalledWith("status", "published");
      expect(result).toEqual(mockCourses);
    });

    test("getCourses should apply filters", async () => {
      const mockCourses = [{ id: "course-1", title: "React Course" }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCourses, error: null }),
      };

      supabase.from.mockReturnValue(mockQuery);

      await getCourses({
        category_id: "programming",
        featured: true,
        search: "React",
      });

      expect(mockQuery.eq).toHaveBeenCalledWith("category_id", "programming");
      expect(mockQuery.eq).toHaveBeenCalledWith("featured", true);
      expect(mockQuery.ilike).toHaveBeenCalledWith("title", "%React%");
    });
  });

  describe("Category Operations", () => {
    test("getCategories should fetch all categories", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Programming", slug: "programming" },
        { id: "cat-2", name: "Design", slug: "design" },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: mockCategories, error: null }),
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await getCategories();

      expect(supabase.from).toHaveBeenCalledWith("categories");
      expect(mockQuery.select).toHaveBeenCalledWith("*");
      expect(mockQuery.order).toHaveBeenCalledWith("name");
      expect(result).toEqual(mockCategories);
    });
  });

  describe("Enrollment Operations", () => {
    test("enrollInCourse should enroll user in course", async () => {
      const mockEnrollment = {
        id: "enrollment-1",
        user_id: "user-123",
        course_id: "course-123",
        enrolled_at: "2024-01-01T00:00:00Z",
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockEnrollment, error: null }),
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await enrollInCourse("user-123", "course-123");

      expect(supabase.from).toHaveBeenCalledWith("enrollments");
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: "user-123",
        course_id: "course-123",
      });
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe("Error Handling", () => {
    test("should throw error when database operation fails", async () => {
      const mockError = new Error("Database connection failed");
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      supabase.from.mockReturnValue(mockQuery);

      await expect(getCourses()).rejects.toThrow("Database connection failed");
    });
  });
});
