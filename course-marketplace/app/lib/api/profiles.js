import { supabase } from '@/app/lib/supabase';

/**
 * Get a user profile by user ID
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
  return data;
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