import { supabase } from "./supabase";

// ============================================================================
// COURSE OPERATIONS
// ============================================================================

// Get all published courses (public)
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

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Get all courses (admin/instructor only)
export const getAllCourses = async (filters = {}) => {
  let query = supabase.from("courses").select(
    `
      *,
      categories(name, slug, color),
      profiles!courses_instructor_id_fkey(first_name, last_name, avatar_url)
    `
  );

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.instructor_id) {
    query = query.eq("instructor_id", filters.instructor_id);
  }

  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
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

// Create new course (instructor/admin only)
export const createCourse = async (courseData) => {
  const { data, error } = await supabase
    .from("courses")
    .insert(courseData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Update course (instructor can update own, admin can update all)
export const updateCourse = async (courseId, updates) => {
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Delete course (instructor can delete own, admin can delete all)
export const deleteCourse = async (courseId) => {
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// Get instructor's courses
export const getInstructorCourses = async (instructorId) => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      categories(name, slug, color)
    `
    )
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

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

// Create category (admin only)
export const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from("categories")
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Update category (admin only)
export const updateCategory = async (categoryId, updates) => {
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Delete category (admin only)
export const deleteCategory = async (categoryId) => {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// ============================================================================
// LESSON OPERATIONS
// ============================================================================

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

export const getLessonById = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Create lesson (instructor/admin only)
export const createLesson = async (lessonData) => {
  const { data, error } = await supabase
    .from("lessons")
    .insert(lessonData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Update lesson (instructor can update own, admin can update all)
export const updateLesson = async (lessonId, updates) => {
  const { data, error } = await supabase
    .from("lessons")
    .update(updates)
    .eq("id", lessonId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Delete lesson (instructor can delete own, admin can delete all)
export const deleteLesson = async (lessonId) => {
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// Reorder lessons (instructor/admin only)
export const reorderLessons = async (courseId, lessonOrders) => {
  const updates = lessonOrders.map(({ id, position }) => ({
    id,
    position,
  }));

  const { data, error } = await supabase
    .from("lessons")
    .upsert(updates)
    .select();

  if (error) {
    throw error;
  }

  return data;
};

// ============================================================================
// ENROLLMENT OPERATIONS
// ============================================================================

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
        total_lessons,
        categories(name, slug, color)
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

// Get enrollment by user and course
export const getEnrollment = async (userId, courseId) => {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
};

// Get course enrollments (instructor/admin only)
export const getCourseEnrollments = async (courseId) => {
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      profiles(first_name, last_name, email, avatar_url)
    `
    )
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Unenroll from course
export const unenrollFromCourse = async (userId, courseId) => {
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// ============================================================================
// PROGRESS OPERATIONS
// ============================================================================

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
    throw error;
  }

  return data;
};

// Get user's course progress
export const getCourseProgress = async (userId, courseId) => {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    throw error;
  }

  return data;
};

// Get all progress for a course (instructor/admin only)
export const getCourseAllProgress = async (courseId) => {
  const { data, error } = await supabase
    .from("progress")
    .select(
      `
      *,
      profiles(first_name, last_name, email),
      lessons(title, position)
    `
    )
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// ============================================================================
// REVIEW OPERATIONS
// ============================================================================

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

// Update review (user can update own)
export const updateReview = async (reviewId, updates) => {
  const { data, error } = await supabase
    .from("reviews")
    .update(updates)
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Delete review (user can delete own, admin can delete all)
export const deleteReview = async (reviewId) => {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// Get user's review for a course
export const getUserCourseReview = async (userId, courseId) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
};

// ============================================================================
// USER/PROFILE OPERATIONS
// ============================================================================

// Get all users (admin only)
export const getAllUsers = async (filters = {}) => {
  let query = supabase.from("profiles").select("*");

  if (filters.role) {
    query = query.eq("role", filters.role);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Get user profile
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Update user role (admin only)
export const updateUserRole = async (userId, role) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// ============================================================================
// PURCHASE OPERATIONS
// ============================================================================

// Create purchase record
export const createPurchase = async (purchaseData) => {
  const { data, error } = await supabase
    .from("purchases")
    .insert(purchaseData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Get user purchases
export const getUserPurchases = async (userId) => {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      courses(title, slug, thumbnail_url)
    `
    )
    .eq("user_id", userId)
    .order("purchased_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Get all purchases (admin only)
export const getAllPurchases = async (filters = {}) => {
  let query = supabase.from("purchases").select(
    `
      *,
      profiles(first_name, last_name, email),
      courses(title, slug)
    `
  );

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.date_from) {
    query = query.gte("purchased_at", filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte("purchased_at", filters.date_to);
  }

  const { data, error } = await query.order("purchased_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return data;
};

// Update purchase status
export const updatePurchaseStatus = async (purchaseId, status) => {
  const { data, error } = await supabase
    .from("purchases")
    .update({ status })
    .eq("id", purchaseId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// ============================================================================
// CONTACT & NEWSLETTER OPERATIONS
// ============================================================================

// Create contact message
export const createContactMessage = async (messageData) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .insert(messageData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Get all contact messages (admin only)
export const getAllContactMessages = async (filters = {}) => {
  let query = supabase.from("contact_messages").select("*");

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.date_from) {
    query = query.gte("created_at", filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte("created_at", filters.date_to);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Update contact message status (admin only)
export const updateContactMessageStatus = async (messageId, status) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", messageId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Subscribe to newsletter
export const subscribeToNewsletter = async (subscriptionData) => {
  const { data, error } = await supabase
    .from("newsletter_subscriptions")
    .upsert(subscriptionData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (email) => {
  const { data, error } = await supabase
    .from("newsletter_subscriptions")
    .update({
      is_active: false,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("email", email)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Get all newsletter subscriptions (admin only)
export const getAllNewsletterSubscriptions = async () => {
  const { data, error } = await supabase
    .from("newsletter_subscriptions")
    .select("*")
    .eq("is_active", true)
    .order("subscribed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// ============================================================================
// ANALYTICS & DASHBOARD OPERATIONS
// ============================================================================

// Get dashboard stats (admin only)
export const getDashboardStats = async () => {
  // Get total courses
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, status");

  if (coursesError) throw coursesError;

  // Get total users
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, role");

  if (usersError) throw usersError;

  // Get total enrollments
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id");

  if (enrollmentsError) throw enrollmentsError;

  // Get total revenue
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("amount")
    .eq("status", "completed");

  if (purchasesError) throw purchasesError;

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === "published").length,
    draftCourses: courses.filter((c) => c.status === "draft").length,
    totalUsers: users.length,
    students: users.filter((u) => u.role === "student").length,
    instructors: users.filter((u) => u.role === "instructor").length,
    admins: users.filter((u) => u.role === "admin").length,
    totalEnrollments: enrollments.length,
    totalRevenue: purchases.reduce((sum, p) => sum + parseFloat(p.amount), 0),
  };

  return stats;
};

// Get instructor dashboard stats
export const getInstructorStats = async (instructorId) => {
  // Get instructor's courses
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, status")
    .eq("instructor_id", instructorId);

  if (coursesError) throw coursesError;

  // Get enrollments for instructor's courses
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, course_id")
    .in(
      "course_id",
      courses.map((c) => c.id)
    );

  if (enrollmentsError) throw enrollmentsError;

  // Get revenue from instructor's courses
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("amount")
    .in(
      "course_id",
      courses.map((c) => c.id)
    )
    .eq("status", "completed");

  if (purchasesError) throw purchasesError;

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === "published").length,
    draftCourses: courses.filter((c) => c.status === "draft").length,
    totalEnrollments: enrollments.length,
    totalRevenue: purchases.reduce((sum, p) => sum + parseFloat(p.amount), 0),
  };

  return stats;
};

// Get recent activity (admin only)
export const getRecentActivity = async () => {
  // Get recent enrollments
  const { data: recentEnrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select(
      `
      enrolled_at,
      profiles(first_name, last_name),
      courses(title)
    `
    )
    .order("enrolled_at", { ascending: false })
    .limit(10);

  if (enrollmentsError) throw enrollmentsError;

  // Get recent reviews
  const { data: recentReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      `
      created_at,
      rating,
      profiles(first_name, last_name),
      courses(title)
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (reviewsError) throw reviewsError;

  // Get recent purchases
  const { data: recentPurchases, error: purchasesError } = await supabase
    .from("purchases")
    .select(
      `
      purchased_at,
      amount,
      profiles(first_name, last_name),
      courses(title)
    `
    )
    .order("purchased_at", { ascending: false })
    .limit(10);

  if (purchasesError) throw purchasesError;

  return {
    enrollments: recentEnrollments,
    reviews: recentReviews,
    purchases: recentPurchases,
  };
};

// ============================================================================
// SEARCH OPERATIONS
// ============================================================================

// Search courses
export const searchCourses = async (searchTerm, filters = {}) => {
  let query = supabase
    .from("courses")
    .select(
      `
      *,
      categories(name, slug, color),
      profiles!courses_instructor_id_fkey(first_name, last_name, avatar_url)
    `
    )
    .eq("status", "published")
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  if (filters.price_min) {
    query = query.gte("price", filters.price_min);
  }

  if (filters.price_max) {
    query = query.lte("price", filters.price_max);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

// Check if user is enrolled in course
export const isUserEnrolled = async (userId, courseId) => {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return !!data;
};

// Check if user has purchased course
export const hasUserPurchased = async (userId, courseId) => {
  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "completed")
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return !!data;
};

// Get course completion percentage
export const getCourseCompletionPercentage = async (userId, courseId) => {
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("completed")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (progressError) throw progressError;

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  if (lessonsError) throw lessonsError;

  if (lessons.length === 0) return 0;

  const completedLessons = progress.filter((p) => p.completed).length;
  return Math.round((completedLessons / lessons.length) * 100);
};

// Generate course slug
export const generateCourseSlug = async (title) => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .single();

    if (error && error.code === "PGRST116") {
      // Slug doesn't exist, we can use it
      break;
    }

    if (error) throw error;

    // Slug exists, try with counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
