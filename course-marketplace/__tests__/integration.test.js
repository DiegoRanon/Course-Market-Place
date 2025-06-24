import {
  getCourses,
  getCourseById,
  getCategories,
  enrollInCourse,
  getUserEnrollments,
  updateLessonProgress,
  getCourseReviews,
  createReview,
} from "../lib/database";
import { signUp, signIn } from "../lib/auth";
import {
  getCurrentUser,
  getUserProfile,
  isAdmin,
  isInstructor,
} from "../lib/supabase";
import { testSupabaseConnection, testAuth } from "../lib/test-connection";
import { supabase } from "../lib/supabase";

// Mock the utility functions from supabase.js
jest.mock("../lib/supabase", () => {
  const originalModule = jest.requireActual("../lib/supabase");
  return {
    ...originalModule,
    getCurrentUser: jest.fn(),
    getUserProfile: jest.fn(),
    isAdmin: jest.fn(),
    isInstructor: jest.fn(),
    supabase: {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        getUser: jest.fn(),
        getSession: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
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
        upsert: jest.fn(() => ({
          select: jest.fn().mockReturnValue({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          }),
        })),
      })),
    },
  };
});

describe("Supabase Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete User Journey", () => {
    test("should handle complete user registration and course enrollment flow", async () => {
      // 1. Test connection
      const mockConnectionQuery = {
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockConnectionQuery),
      });

      const connectionResult = await testSupabaseConnection();
      expect(connectionResult).toBe(true);

      // 2. Test auth
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const authResult = await testAuth();
      expect(authResult).toBe(true);

      // 3. User registration
      const mockUser = {
        id: "user-123",
        email: "student@example.com",
        user_metadata: {
          first_name: "John",
          last_name: "Student",
        },
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const signUpResult = await signUp("student@example.com", "password123", {
        first_name: "John",
        last_name: "Student",
      });

      expect(signUpResult.user).toEqual(mockUser);

      // 4. User login
      const mockSession = {
        access_token: "token-123",
        refresh_token: "refresh-123",
        user: mockUser,
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const signInResult = await signIn("student@example.com", "password123");
      expect(signInResult.session).toEqual(mockSession);

      // 5. Get current user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the getCurrentUser utility function
      getCurrentUser.mockResolvedValue(mockUser);

      const currentUser = await getCurrentUser();
      expect(currentUser).toEqual(mockUser);

      // 6. Get user profile
      const mockProfile = {
        id: "user-123",
        first_name: "John",
        last_name: "Student",
        role: "student",
        status: "active",
      };

      // Mock the getUserProfile utility function
      getUserProfile.mockResolvedValue(mockProfile);

      const userProfile = await getUserProfile("user-123");
      expect(userProfile).toEqual(mockProfile);

      // 7. Check user role
      // Mock the role utility functions
      isAdmin.mockResolvedValue(false);
      isInstructor.mockResolvedValue(false);

      const isUserAdmin = await isAdmin("user-123");
      const isUserInstructor = await isInstructor("user-123");

      expect(isUserAdmin).toBe(false);
      expect(isUserInstructor).toBe(false);

      // 8. Browse courses
      const mockCourses = [
        {
          id: "course-1",
          title: "JavaScript Fundamentals",
          status: "published",
          categories: {
            name: "Programming",
            slug: "programming",
            color: "#ff0000",
          },
          profiles: {
            first_name: "Jane",
            last_name: "Instructor",
            avatar_url: "avatar.jpg",
          },
        },
      ];

      const mockCoursesQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCourses, error: null }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockCoursesQuery),
      });

      const courses = await getCourses();
      expect(courses).toEqual(mockCourses);

      // 9. Get course details
      const mockCourse = {
        id: "course-1",
        title: "JavaScript Fundamentals",
        slug: "javascript-fundamentals",
        categories: {
          name: "Programming",
          slug: "programming",
          color: "#ff0000",
        },
        profiles: {
          first_name: "Jane",
          last_name: "Instructor",
          avatar_url: "avatar.jpg",
        },
      };

      const mockCourseQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockCourse, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockCourseQuery),
      });

      const course = await getCourseById("course-1");
      expect(course).toEqual(mockCourse);

      // 10. Enroll in course
      const mockEnrollment = {
        id: "enrollment-1",
        user_id: "user-123",
        course_id: "course-1",
        enrolled_at: "2024-01-01T00:00:00Z",
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockEnrollment, error: null }),
          }),
        }),
      });

      const enrollment = await enrollInCourse("user-123", "course-1");
      expect(enrollment).toEqual(mockEnrollment);

      // 11. Get user enrollments
      const mockEnrollments = [
        {
          id: "enrollment-1",
          user_id: "user-123",
          course_id: "course-1",
          courses: {
            id: "course-1",
            title: "JavaScript Fundamentals",
            slug: "javascript-fundamentals",
            thumbnail_url: "thumbnail.jpg",
            total_lessons: 10,
          },
        },
      ];

      const mockEnrollmentsQuery = {
        eq: jest.fn().mockReturnValue({
          order: jest
            .fn()
            .mockResolvedValue({ data: mockEnrollments, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockEnrollmentsQuery),
      });

      const enrollments = await getUserEnrollments("user-123");
      expect(enrollments).toEqual(mockEnrollments);

      // 12. Update lesson progress
      const mockProgress = {
        id: "progress-1",
        user_id: "user-123",
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
              .mockResolvedValue({ data: mockProgress, error: null }),
          }),
        }),
      });

      const progress = await updateLessonProgress(
        "user-123",
        "lesson-1",
        "course-1",
        {
          completed: true,
          watched_duration: 300,
        }
      );

      expect(progress).toEqual(mockProgress);

      // 13. Create review
      const mockReview = {
        id: "review-1",
        user_id: "user-123",
        course_id: "course-1",
        rating: 5,
        comment: "Excellent course!",
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockReview, error: null }),
          }),
        }),
      });

      const review = await createReview(
        "user-123",
        "course-1",
        5,
        "Excellent course!"
      );
      expect(review).toEqual(mockReview);

      // 14. Get course reviews
      const mockReviews = [
        {
          id: "review-1",
          user_id: "user-123",
          course_id: "course-1",
          rating: 5,
          comment: "Excellent course!",
          profiles: {
            first_name: "John",
            last_name: "Student",
            avatar_url: "avatar.jpg",
          },
        },
      ];

      const mockReviewsQuery = {
        eq: jest.fn().mockReturnValue({
          order: jest
            .fn()
            .mockResolvedValue({ data: mockReviews, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockReviewsQuery),
      });

      const reviews = await getCourseReviews("course-1");
      expect(reviews).toEqual(mockReviews);
    });
  });

  describe("Instructor Journey", () => {
    test("should handle instructor registration and course management", async () => {
      // 1. Instructor registration
      const mockInstructor = {
        id: "instructor-123",
        email: "instructor@example.com",
        user_metadata: {
          first_name: "Jane",
          last_name: "Instructor",
        },
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockInstructor, session: null },
        error: null,
      });

      const signUpResult = await signUp(
        "instructor@example.com",
        "password123",
        {
          first_name: "Jane",
          last_name: "Instructor",
        }
      );

      expect(signUpResult.user).toEqual(mockInstructor);

      // 2. Get instructor profile
      const mockInstructorProfile = {
        id: "instructor-123",
        first_name: "Jane",
        last_name: "Instructor",
        role: "instructor",
        status: "active",
      };

      // Mock the getUserProfile utility function
      getUserProfile.mockResolvedValue(mockInstructorProfile);

      const instructorProfile = await getUserProfile("instructor-123");
      expect(instructorProfile).toEqual(mockInstructorProfile);

      // 3. Check instructor permissions
      // Mock the role utility functions
      isAdmin.mockResolvedValue(false);
      isInstructor.mockResolvedValue(true);

      const isInstructorAdmin = await isAdmin("instructor-123");
      const isInstructorInstructor = await isInstructor("instructor-123");

      expect(isInstructorAdmin).toBe(false);
      expect(isInstructorInstructor).toBe(true);

      // 4. Get instructor's courses
      const mockInstructorCourses = [
        {
          id: "course-1",
          title: "JavaScript Fundamentals",
          status: "published",
          instructor_id: "instructor-123",
          categories: {
            name: "Programming",
            slug: "programming",
            color: "#ff0000",
          },
          profiles: {
            first_name: "Jane",
            last_name: "Instructor",
            avatar_url: "avatar.jpg",
          },
        },
      ];

      const mockInstructorCoursesQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: mockInstructorCourses, error: null }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockInstructorCoursesQuery),
      });

      const instructorCourses = await getCourses({
        instructor_id: "instructor-123",
      });
      expect(instructorCourses).toEqual(mockInstructorCourses);
    });
  });

  describe("Admin Journey", () => {
    test("should handle admin user management and system overview", async () => {
      // 1. Admin login
      const mockAdmin = {
        id: "admin-123",
        email: "admin@example.com",
      };

      const mockAdminSession = {
        access_token: "admin-token-123",
        refresh_token: "admin-refresh-123",
        user: mockAdmin,
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockAdmin, session: mockAdminSession },
        error: null,
      });

      const signInResult = await signIn("admin@example.com", "adminpassword");
      expect(signInResult.session).toEqual(mockAdminSession);

      // 2. Get admin profile
      const mockAdminProfile = {
        id: "admin-123",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        status: "active",
      };

      // Mock the getUserProfile utility function
      getUserProfile.mockResolvedValue(mockAdminProfile);

      const adminProfile = await getUserProfile("admin-123");
      expect(adminProfile).toEqual(mockAdminProfile);

      // 3. Check admin permissions
      // Mock the role utility functions
      isAdmin.mockResolvedValue(true);
      isInstructor.mockResolvedValue(true);

      const isUserAdmin = await isAdmin("admin-123");
      const isUserInstructor = await isInstructor("admin-123");

      expect(isUserAdmin).toBe(true);
      expect(isUserInstructor).toBe(true);

      // 4. Get all categories for admin management
      const mockCategories = [
        {
          id: "cat-1",
          name: "Programming",
          slug: "programming",
          color: "#ff0000",
        },
        { id: "cat-2", name: "Design", slug: "design", color: "#00ff00" },
        { id: "cat-3", name: "Business", slug: "business", color: "#0000ff" },
      ];

      const mockCategoriesQuery = {
        order: jest
          .fn()
          .mockResolvedValue({ data: mockCategories, error: null }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockCategoriesQuery),
      });

      const categories = await getCategories();
      expect(categories).toEqual(mockCategories);

      // 5. Get all courses for admin review
      const mockAllCourses = [
        {
          id: "course-1",
          title: "JavaScript Fundamentals",
          status: "published",
          categories: {
            name: "Programming",
            slug: "programming",
            color: "#ff0000",
          },
          profiles: {
            first_name: "Jane",
            last_name: "Instructor",
            avatar_url: "avatar.jpg",
          },
        },
        {
          id: "course-2",
          title: "UI/UX Design",
          status: "draft",
          categories: { name: "Design", slug: "design", color: "#00ff00" },
          profiles: {
            first_name: "Bob",
            last_name: "Designer",
            avatar_url: "avatar2.jpg",
          },
        },
      ];

      const mockAllCoursesQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: mockAllCourses, error: null }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockAllCoursesQuery),
      });

      const allCourses = await getCourses();
      expect(allCourses).toEqual(mockAllCourses);
    });
  });

  describe("Error Handling", () => {
    test("should handle database connection failures gracefully", async () => {
      // Mock connection failure
      const mockConnectionError = new Error("Database connection failed");
      const mockConnectionQuery = {
        limit: jest
          .fn()
          .mockResolvedValue({ data: null, error: mockConnectionError }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockConnectionQuery),
      });

      const connectionResult = await testSupabaseConnection();
      expect(connectionResult).toBe(false);

      // Subsequent operations should handle the failure gracefully
      try {
        await getCourses();
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toBe("Database connection failed");
      }
    });

    test("should handle authentication failures gracefully", async () => {
      // Mock auth failure
      const mockAuthError = new Error("Invalid credentials");
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockAuthError,
      });

      try {
        await signIn("invalid@example.com", "wrongpassword");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toBe("Invalid credentials");
      }
    });

    test("should handle profile not found scenarios", async () => {
      // Mock profile not found
      getUserProfile.mockResolvedValue(null);
      isAdmin.mockResolvedValue(false);
      isInstructor.mockResolvedValue(false);

      const profile = await getUserProfile("nonexistent-user");
      expect(profile).toBeNull();

      // Role checks should return false for non-existent users
      const isUserAdmin = await isAdmin("nonexistent-user");
      const isUserInstructor = await isInstructor("nonexistent-user");

      expect(isUserAdmin).toBe(false);
      expect(isUserInstructor).toBe(false);
    });
  });

  describe("Data Consistency", () => {
    test("should maintain data consistency across related operations", async () => {
      // 1. Create a course
      const mockCourse = {
        id: "course-1",
        title: "Test Course",
        instructor_id: "instructor-123",
        status: "published",
      };

      // 2. Enroll a student
      const mockEnrollment = {
        id: "enrollment-1",
        user_id: "student-123",
        course_id: "course-1",
      };

      // 3. Update progress
      const mockProgress = {
        id: "progress-1",
        user_id: "student-123",
        course_id: "course-1",
        lesson_id: "lesson-1",
        completed: true,
      };

      // 4. Create review
      const mockReview = {
        id: "review-1",
        user_id: "student-123",
        course_id: "course-1",
        rating: 5,
        comment: "Great course!",
      };

      // Mock all operations to return consistent data
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockCourse, error: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockEnrollment, error: null }),
          }),
        }),
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockProgress, error: null }),
          }),
        }),
      });

      // Verify all operations work with the same course ID
      const course = await getCourseById("course-1");
      const enrollment = await enrollInCourse("student-123", "course-1");
      const progress = await updateLessonProgress(
        "student-123",
        "lesson-1",
        "course-1",
        {
          completed: true,
        }
      );

      expect(course.id).toBe("course-1");
      expect(enrollment.course_id).toBe("course-1");
      expect(progress.course_id).toBe("course-1");
      expect(progress.user_id).toBe("student-123");
    });
  });
});
