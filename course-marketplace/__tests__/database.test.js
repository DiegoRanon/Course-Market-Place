import {
  getCourses,
  getCourseById,
  getCourseBySlug,
  getCategories,
  getCategoryBySlug,
  getLessonsByCourseId,
  enrollInCourse,
  getUserEnrollments,
  updateLessonProgress,
  getLessonProgress,
  getCourseReviews,
  createReview,
} from "../lib/database";
import { supabase } from "../lib/supabase";

// Mock Supabase client
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

describe("Database Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Course Operations", () => {
    test("getCourses should fetch published courses with filters", async () => {
      const mockData = [
        {
          id: "1",
          title: "Test Course",
          status: "published",
          categories: {
            name: "Programming",
            slug: "programming",
            color: "#ff0000",
          },
          profiles: {
            first_name: "John",
            last_name: "Doe",
            avatar_url: "avatar.jpg",
          },
        },
      ];

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await getCourses({ category_id: "1", featured: true });

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("courses");
    });

    test("getCourses should handle errors", async () => {
      const mockError = new Error("Database error");
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      await expect(getCourses()).rejects.toThrow("Database error");
    });

    test("getCourseById should fetch a single course", async () => {
      const mockData = {
        id: "1",
        title: "Test Course",
        categories: {
          name: "Programming",
          slug: "programming",
          color: "#ff0000",
        },
        profiles: {
          first_name: "John",
          last_name: "Doe",
          avatar_url: "avatar.jpg",
        },
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await getCourseById("1");

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("courses");
    });

    test("getCourseBySlug should fetch a course by slug", async () => {
      const mockData = {
        id: "1",
        title: "Test Course",
        slug: "test-course",
        categories: {
          name: "Programming",
          slug: "programming",
          color: "#ff0000",
        },
        profiles: {
          first_name: "John",
          last_name: "Doe",
          avatar_url: "avatar.jpg",
        },
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await getCourseBySlug("test-course");

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("courses");
    });
  });

  describe("Category Operations", () => {
    test("getCategories should fetch all categories", async () => {
      const mockData = [
        { id: "1", name: "Programming", slug: "programming", color: "#ff0000" },
        { id: "2", name: "Design", slug: "design", color: "#00ff00" },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });

      const result = await getCategories();

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("categories");
    });

    test("getCategoryBySlug should fetch a category by slug", async () => {
      const mockData = {
        id: "1",
        name: "Programming",
        slug: "programming",
        color: "#ff0000",
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await getCategoryBySlug("programming");

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("categories");
    });
  });

  describe("Lesson Operations", () => {
    test("getLessonsByCourseId should fetch lessons for a course", async () => {
      const mockData = [
        { id: "1", title: "Lesson 1", position: 1, course_id: "course-1" },
        { id: "2", title: "Lesson 2", position: 2, course_id: "course-1" },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await getLessonsByCourseId("course-1");

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("lessons");
    });
  });

  describe("Enrollment Operations", () => {
    test("enrollInCourse should create a new enrollment", async () => {
      const mockData = {
        id: "1",
        user_id: "user-1",
        course_id: "course-1",
        enrolled_at: "2024-01-01T00:00:00Z",
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await enrollInCourse("user-1", "course-1");

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("enrollments");
    });

    test("getUserEnrollments should fetch user enrollments", async () => {
      const mockData = [
        {
          id: "1",
          user_id: "user-1",
          course_id: "course-1",
          courses: {
            id: "course-1",
            title: "Test Course",
            slug: "test-course",
            thumbnail_url: "thumbnail.jpg",
            total_lessons: 10,
          },
        },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await getUserEnrollments("user-1");

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("enrollments");
    });
  });

  describe("Progress Operations", () => {
    test("updateLessonProgress should upsert lesson progress", async () => {
      const mockData = {
        id: "1",
        user_id: "user-1",
        lesson_id: "lesson-1",
        course_id: "course-1",
        completed: true,
        watched_duration: 300,
      };

      supabase.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await updateLessonProgress(
        "user-1",
        "lesson-1",
        "course-1",
        {
          completed: true,
          watched_duration: 300,
        }
      );

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("progress");
    });

    test("getLessonProgress should fetch lesson progress", async () => {
      const mockData = {
        id: "1",
        user_id: "user-1",
        lesson_id: "lesson-1",
        course_id: "course-1",
        completed: true,
        watched_duration: 300,
      };

      // Create a mock that supports chained .eq() calls
      const eqChain = () => ({
        eq: eqChain,
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      supabase.from.mockReturnValue({
        select: jest.fn(() => eqChain()),
      });

      const result = await getLessonProgress("user-1", "lesson-1");

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("progress");
    });

    test("getLessonProgress should handle not found gracefully", async () => {
      const notFoundError = { code: "PGRST116", message: "Not found" };

      // Create a mock that supports chained .eq() calls
      const eqChain = () => ({
        eq: eqChain,
        single: jest
          .fn()
          .mockResolvedValue({ data: null, error: notFoundError }),
      });

      supabase.from.mockReturnValue({
        select: jest.fn(() => eqChain()),
      });

      const result = await getLessonProgress("user-1", "lesson-1");

      expect(result).toBeNull();
    });
  });

  describe("Review Operations", () => {
    test("getCourseReviews should fetch course reviews", async () => {
      const mockData = [
        {
          id: "1",
          user_id: "user-1",
          course_id: "course-1",
          rating: 5,
          comment: "Great course!",
          profiles: {
            first_name: "John",
            last_name: "Doe",
            avatar_url: "avatar.jpg",
          },
        },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await getCourseReviews("course-1");

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("reviews");
    });

    test("createReview should create a new review", async () => {
      const mockData = {
        id: "1",
        user_id: "user-1",
        course_id: "course-1",
        rating: 5,
        comment: "Great course!",
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await createReview(
        "user-1",
        "course-1",
        5,
        "Great course!"
      );

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("reviews");
    });
  });

  describe("Error Handling", () => {
    test("should throw error when database operation fails", async () => {
      const mockError = new Error("Database connection failed");

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      });

      await expect(getCategories()).rejects.toThrow(
        "Database connection failed"
      );
    });

    test("should throw error when insert operation fails", async () => {
      const mockError = new Error("Insert failed");

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      });

      await expect(enrollInCourse("user-1", "course-1")).rejects.toThrow(
        "Insert failed"
      );
    });
  });
});
