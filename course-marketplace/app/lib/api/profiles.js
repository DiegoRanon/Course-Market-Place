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
