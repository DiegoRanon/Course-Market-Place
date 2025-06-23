import { supabase } from "./supabase";

// Course operations
export const getCourses = async (filters = {}) => {
  let query = supabase
    .from("courses")
    .select(
      `
      *,
      categories(name, slug, color),
      profiles!courses_instructor_id_fkey(first_name, last_name, avatar_url)
    `
    )
    .eq("status", "published");

  // Apply filters
  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  if (filters.instructor_id) {
    query = query.eq("instructor_id", filters.instructor_id);
  }

  if (filters.featured) {
    query = query.eq("featured", true);
  }

  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const getCourseById = async (id) => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      categories(name, slug, color),
      profiles!courses_instructor_id_fkey(first_name, last_name, avatar_url, bio)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getCourseBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      categories(name, slug, color),
      profiles!courses_instructor_id_fkey(first_name, last_name, avatar_url, bio)
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Category operations
export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    throw error;
  }

  return data;
};

export const getCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Lesson operations
export const getLessonsByCourseId = async (courseId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position");

  if (error) {
    throw error;
  }

  return data;
};

// Enrollment operations
export const enrollInCourse = async (userId, courseId) => {
  const { data, error } = await supabase
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserEnrollments = async (userId) => {
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      courses(
        id,
        title,
        slug,
        thumbnail_url,
        total_lessons
      )
    `
    )
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Progress operations
export const updateLessonProgress = async (
  userId,
  lessonId,
  courseId,
  progress
) => {
  const { data, error } = await supabase
    .from("progress")
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      ...progress,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getLessonProgress = async (userId, lessonId) => {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found"
    throw error;
  }

  return data;
};

// Review operations
export const getCourseReviews = async (courseId) => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles(first_name, last_name, avatar_url)
    `
    )
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const createReview = async (userId, courseId, rating, comment) => {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: userId,
      course_id: courseId,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
