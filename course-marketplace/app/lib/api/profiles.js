import { supabase } from "@/app/lib/supabase";

/**
 * Get a user profile by user ID
 */
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      console.error("Error getting user profile: userId is required");
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(
        "Error getting user profile:",
        error.message || JSON.stringify(error)
      );
      return null;
    }

    if (!data) {
      console.warn(
        `No profile found for user ID: ${userId}. Profile might not be created yet.`
      );
      // Return a default profile object to prevent null reference errors
      return {
        id: userId,
        role: "student", // Default role
        full_name: "",
        first_name: "",
        last_name: "",
        status: "pending",
      };
    }

    return data;
  } catch (e) {
    console.error("Exception in getUserProfile:", e.message || e);
    return null;
  }
};

/**
 * Update a user profile
 */
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Check if user is admin
 */
export const isAdmin = async (userId) => {
  const profile = await getUserProfile(userId);
  return profile?.role === "admin";
};

/**
 * Check if user is creator
 * Note: Admins also have creator privileges
 */
export const isCreator = async (userId) => {
  const profile = await getUserProfile(userId);
  return profile?.role === "creator" || profile?.role === "admin";
};

/**
 * Get all creators (users with role "creator" only)
 */
export const getAllCreators = async () => {
  try {
    // Get users with role "creator" only
    const { data: creators, error: creatorsError } = await supabase
      .from("profiles")
      .select("id, full_name, first_name, last_name, avatar_url")
      .eq("role", "creator");

    if (creatorsError) {
      console.error("Error fetching creators:", creatorsError);
      return { data: [], error: creatorsError };
    }

    // Format names if needed
    const formattedCreators = (creators || []).map((creator) => ({
      ...creator,
      // If full_name is empty, use first_name + last_name
      full_name:
        creator.full_name ||
        `${creator.first_name || ""} ${creator.last_name || ""}`.trim() ||
        "Unknown Creator",
    }));

    return { data: formattedCreators, error: null };
  } catch (e) {
    console.error("Exception in getAllCreators:", e);
    return { data: [], error: e };
  }
};

/**
 * Get all users with profile information
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Exception fetching users:", error);
    return { data: null, error };
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Exception fetching user:", error);
    return { data: null, error };
  }
}

/**
 * Get user enrollments
 */
export async function getUserEnrollments(userId) {
  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses:course_id (id, title, thumbnail_url)
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user enrollments:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Exception fetching user enrollments:", error);
    return { data: null, error };
  }
}

/**
 * Get user purchases
 */
export async function getUserPurchases(userId) {
  try {
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        *,
        courses:course_id (id, title)
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user purchases:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Exception fetching user purchases:", error);
    return { data: null, error };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId, role) {
  try {
    if (!['admin', 'creator', 'student'].includes(role)) {
      return { success: false, error: "Invalid role" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user role:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Exception updating user role:", error);
    return { success: false, error };
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(userId, status) {
  try {
    if (!['active', 'inactive'].includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ status, updated_at: new Date() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user status:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Exception updating user status:", error);
    return { success: false, error };
  }
}

// getAllCreators is already defined above
