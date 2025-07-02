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
