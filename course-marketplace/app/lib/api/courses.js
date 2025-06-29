import { supabase } from "@/app/lib/supabase";

/**
 * Get a list of all published courses
 */
export const getPublishedCourses = async () => {
  try {
    console.log("Fetching published courses...");

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
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
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
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
    const { data, error } = await supabase
      .from("courses")
      .insert(courseData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (err) {
    console.error("Error creating course:", err);
    return { data: null, error: err.message };
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
