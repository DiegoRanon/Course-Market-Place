import { supabase } from "@/app/lib/supabase";

/**
 * Check if a user is enrolled in a specific course
 * @param {string} userId - The user ID
 * @param {string} courseId - The course ID
 * @returns {Promise<{data: Object|null, error: Object|null}>} - The enrollment data if found
 */
export const checkEnrollmentStatus = async (userId, courseId) => {
  try {
    // Validate input parameters
    if (!userId || !courseId) {
      console.log('Missing required parameters for enrollment check');
      return { data: null, error: "Missing required parameters" };
    }

    console.log(`Checking enrollment for user ${userId} in course ${courseId}`);
    
    // First check if the table is accessible to avoid cryptic errors
    const { error: tableCheckError } = await supabase
      .from("enrollments")
      .select("count")
      .limit(1);
      
    if (tableCheckError) {
      console.error("Error accessing enrollments table:", tableCheckError);
      return { data: null, error: "Cannot access enrollments" };
    }

    // Try the actual query
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle(); // Use maybeSingle to avoid error if no record found

    if (error) {
      console.error("Error checking enrollment status:", error);
      return { data: null, error };
    }

    // If we get here, the query was successful
    // data will be null if no record was found, or the record if found
    console.log("Enrollment check result:", data ? "Enrolled" : "Not enrolled");
    return { data, error: null };
  } catch (error) {
    console.error("Exception checking enrollment status:", error);
    return { data: null, error: "Failed to check enrollment status" };
  }
};

/**
 * Create a new enrollment record
 * @param {string} courseId - The course ID
 * @returns {Promise<{data: Object|null, error: Object|null}>} - The created enrollment data
 */
export const createEnrollment = async (courseId) => {
  try {
    if (!courseId) {
      return { data: null, error: "Missing course ID parameter" };
    }

    // Use Supabase Auth to get the current user ID
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("enrollments")
      .insert([
        {
          course_id: courseId,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating enrollment:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Exception creating enrollment:", error);
    return { data: null, error: "Failed to create enrollment" };
  }
};

/**
 * Get all enrollments for a user
 * @param {string} userId - The user ID
 * @returns {Promise<{data: Array|null, error: Object|null}>} - The enrollment data if found
 */
export const getUserEnrollments = async (userId) => {
  try {
    if (!userId) {
      return { data: null, error: "Missing user ID parameter" };
    }

    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
        *,
        course:courses(
          id,
          title,
          description,
          thumbnail_url,
          video_url
        )
      `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user enrollments:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Exception fetching user enrollments:", error);
    return { data: null, error: "Failed to fetch user enrollments" };
  }
};

/**
 * Update enrollment status
 * @param {string} enrollmentId - The enrollment ID
 * @param {string} status - The new status ('active', 'completed', 'refunded', 'cancelled')
 * @returns {Promise<{data: Object|null, error: Object|null}>} - The updated enrollment data
 */
export const updateEnrollmentStatus = async (enrollmentId, status) => {
  try {
    // Validate the status value against the allowed values in the database
    const validStatuses = ['active', 'completed', 'refunded', 'cancelled'];
    if (!enrollmentId || !status || !validStatuses.includes(status)) {
      return { data: null, error: "Missing required parameters or invalid status" };
    }

    const { data, error } = await supabase
      .from("enrollments")
      .update({ status })
      .eq("id", enrollmentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating enrollment status:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Exception updating enrollment status:", error);
    return { data: null, error: "Failed to update enrollment status" };
  }
}; 