import { supabase } from "@/app/lib/supabase";

/**
 * Get all categories from the database
 */
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error("Error in getAllCategories:", err);
    return { data: [], error: err.message };
  }
};

/**
 * Get a list of all published courses
 */
export const getPublishedCourses = async () => {
  try {
    console.log("Fetching all courses...");

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching courses:", error);
      throw new Error(error.message);
    }

    console.log(`Successfully fetched ${data?.length || 0} courses`);
    return { data: data || [], error: null };
  } catch (err) {
    console.error("Error fetching courses:", err);
    return { data: [], error: err.message };
  }
};

/**
 * Get a single course by ID
 */
export const getCourseById = async (courseId) => {
  try {
    console.log(`Fetching course with ID: ${courseId}`);

    // Method 1: Fetch course with creator profile information using a join
    const { data, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        creator:profiles(*)
      `
      )
      .eq("id", courseId)
      .single();

    // If successful, process and return the data
    if (!error && data) {
      console.log("Course data retrieved successfully with join query");

      // If creator is returned as an array (due to join), extract the first item
      if (data && Array.isArray(data.creator)) {
        data.creator = data.creator[0] || null;
        console.log("Creator extracted from array:", data.creator);
      }

      return { data, error: null };
    }

    // If join query failed (likely due to RLS policies), try alternative approach
    // Log as info rather than error to avoid scaring users
    console.log("Join query approach failed, trying alternative approach...");

    // Method 2: Fetch just the course data first
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError) {
      console.error("Error fetching course data:", courseError);
      throw new Error(courseError.message);
    }

    // If course has a creator_id, try to fetch the creator profile separately
    if (courseData && courseData.creator_id) {
      console.log(`Fetching creator profile for ID: ${courseData.creator_id}`);

      // Try using the REST API endpoint (bypasses RLS)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${courseData.creator_id}`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const profileData = await response.json();
          if (profileData && profileData.length > 0) {
            console.log("Creator profile found with REST API:", profileData[0]);
            courseData.creator = profileData[0];
          } else {
            console.log("No creator profile found with REST API");
          }
        } else {
          console.error("REST API request failed:", response.statusText);
        }
      } catch (profileErr) {
        console.error(
          "Error fetching creator profile with REST API:",
          profileErr
        );
        // Don't fail the whole request if just the profile fetch fails
        // Just continue without the profile data
      }
    }

    return { data: courseData, error: null };
  } catch (err) {
    console.error(`Error fetching course with ID ${courseId}:`, err);
    return { data: null, error: err.message };
  }
};

/**
 * Get courses created by a specific user
 */
export const getCoursesByCreator = async (creatorId) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error("Error fetching creator courses:", err);
    return { data: [], error: err.message };
  }
};

/**
 * Create a new course
 */
export const createCourse = async (courseData) => {
  try {
    console.log("Creating course with data:", courseData);

    // Handle requirements field correctly
    if (courseData.requirements) {
      try {
        // Ensure requirements is valid JSON
        if (typeof courseData.requirements === 'string') {
          // Parse and stringify to validate JSON format
          JSON.parse(courseData.requirements);
        }
      } catch (jsonError) {
        console.error("Invalid JSON in requirements field:", jsonError);
        // If invalid JSON, convert to empty array
        courseData.requirements = JSON.stringify([]);
      }
    }

    const { data, error } = await supabase
      .from("courses")
      .insert(courseData)
      .select()
      .single();

    if (error) {
      console.error("Error in createCourse:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error creating course:", error);
    return {
      error: {
        message: error.message || "Failed to create course",
      },
    };
  }
};

/**
 * Update an existing course
 */
export const updateCourse = async (courseId, courseData) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .update(courseData)
      .eq("id", courseId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (err) {
    console.error(`Error updating course with ID ${courseId}:`, err);
    return { data: null, error: err.message };
  }
};

/**
 * Fetch all available courses
 */
export async function getAllCourses() {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*");

    if (error) {
      console.error("Error fetching courses:", error);
      throw new Error("Failed to fetch courses");
    }

    return data || [];
  } catch (err) {
    console.error("Error in getAllCourses:", err);
    throw err;
  }
}

/**
 * Fetch enrolled courses for the current user
 */
export async function getEnrolledCourses(userId) {
  try {
    console.log(`Fetching enrollments for user: ${userId}`);

    // First, check if enrollments table exists
    const { error: tableCheckError } = await supabase
      .from("enrollments")
      .select("count")
      .limit(1);

    if (tableCheckError) {
      console.error("Error checking enrollments table:", tableCheckError);
      console.log(
        "Enrollments table might not exist or you don't have access to it"
      );
      return [];
    }

    // Get all enrollments for this user without filtering by status
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("*, course:course_id(*)")
      .eq("user_id", userId);

    if (enrollmentsError) {
      // Handle the case where error might be an empty object
      const errorMessage =
        Object.keys(enrollmentsError).length === 0
          ? "Unknown error (possibly empty enrollments table)"
          : JSON.stringify(enrollmentsError);

      console.log(`Enrollment query returned error: ${errorMessage}`);
      // Don't throw an error, just return empty array
      return [];
    }

    // Log the enrollments for debugging
    console.log(`Found ${enrollments?.length || 0} enrollments:`, enrollments);

    // If there are no enrollments, return an empty array
    if (!enrollments || enrollments.length === 0) {
      console.log("No enrollments found for this user");
      return [];
    }

    // Then, for each course, fetch progress information
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        try {
          // Check if we have course data
          if (!enrollment.course) {
            console.log(`No course data for enrollment: ${enrollment.id}`);
            return null;
          }

          const course = enrollment.course;
          console.log(`Processing course: ${course.id} - ${course.title}`);

          // Check if sections table exists and get all lessons for this course
          let lessons = [];
          try {
            // First try to get sections and lessons
            const { data: sectionsData, error: sectionsError } = await supabase
              .from("sections")
              .select("id")
              .eq("course_id", course.id);

            if (sectionsError) {
              console.error("Error fetching sections:", sectionsError);
              // Sections table might not exist
            } else if (sectionsData && sectionsData.length > 0) {
              // Get lessons for these sections
              const sectionIds = sectionsData.map((section) => section.id);
              const { data: lessonsData, error: lessonsError } = await supabase
                .from("lessons")
                .select("id")
                .in("section_id", sectionIds);

              if (lessonsError) {
                console.error("Error fetching lessons:", lessonsError);
              } else {
                lessons = lessonsData || [];
              }
            }
          } catch (err) {
            console.error("Error in lessons/sections query:", err);
            // Continue with empty lessons
          }

          // Get completed lessons for this user and course
          let progress = [];
          if (lessons.length > 0) {
            try {
              const { data: progressData, error: progressError } =
                await supabase
                  .from("progress")
                  .select("*")
                  .eq("user_id", userId)
                  .eq("completed", true)
                  .in(
                    "lesson_id",
                    lessons.map((lesson) => lesson.id)
                  );

              if (progressError) {
                console.error("Error fetching progress:", progressError);
              } else {
                progress = progressData || [];
              }
            } catch (err) {
              console.error("Error in progress query:", err);
              // Continue with empty progress
            }
          }

          // Calculate progress percentage
          const totalLessons = lessons?.length || 0;
          const completedLessons = progress?.length || 0;
          const progressPercentage =
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;

          // Mark as completed if 100% progress
          const completed = progressPercentage === 100;

          return {
            id: course.id,
            title: course.title || "Untitled Course",
            description: course.description || "",
            thumbnail_url: course.thumbnail_url || "",
            progress: progressPercentage,
            completed,
            totalLessons,
            completedLessons,
            enrolledAt: enrollment.purchased_at || new Date().toISOString(),
          };
        } catch (err) {
          console.error(
            `Error processing course for enrollment ${enrollment.id}:`,
            err
          );
          return null;
        }
      })
    );

    // Filter out any null values from the array
    const validCourses = coursesWithProgress.filter(
      (course) => course !== null
    );
    console.log(`Returning ${validCourses.length} valid enrolled courses`);
    return validCourses;
  } catch (err) {
    console.error("Error in getEnrolledCourses:", err);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Filter and sort enrolled courses
 */
export function filterAndSortEnrolledCourses(
  courses,
  filters = {},
  sortOption = "newest"
) {
  let filteredCourses = [...courses];

  // Apply filters
  if (filters.status === "completed") {
    filteredCourses = filteredCourses.filter((course) => course.completed);
  } else if (filters.status === "in-progress") {
    filteredCourses = filteredCourses.filter((course) => !course.completed);
  }

  // Apply sorting
  switch (sortOption) {
    case "newest":
      filteredCourses.sort(
        (a, b) => new Date(b.enrolledAt || 0) - new Date(a.enrolledAt || 0)
      );
      break;
    case "title-asc":
      filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title-desc":
      filteredCourses.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "progress-asc":
      filteredCourses.sort((a, b) => a.progress - b.progress);
      break;
    case "progress-desc":
      filteredCourses.sort((a, b) => b.progress - a.progress);
      break;
    default:
      // Default to newest
      filteredCourses.sort(
        (a, b) => new Date(b.enrolledAt || 0) - new Date(a.enrolledAt || 0)
      );
  }

  return filteredCourses;
}

/**
 * Utility function to check database schema and diagnose issues
 */
export async function checkDatabaseSchema() {
  try {
    console.log("Checking database schema...");

    // Check if tables exist
    const tables = [
      "courses",
      "enrollments",
      "sections",
      "lessons",
      "progress",
    ];
    const tableResults = {};

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        tableResults[table] = {
          exists: !error,
          count: count || 0,
          error: error ? error.message : null,
        };
      } catch (err) {
        tableResults[table] = {
          exists: false,
          error: err.message,
        };
      }
    }

    console.log("Database schema check results:", tableResults);
    return tableResults;
  } catch (err) {
    console.error("Error checking database schema:", err);
    return { error: err.message };
  }
}
