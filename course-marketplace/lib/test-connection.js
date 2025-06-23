import { supabase } from "./supabase";

export const testSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
      return false;
    }

    console.log("✅ Supabase connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection error:", error.message);
    return false;
  }
};

// Test authentication
export const testAuth = async () => {
  try {
    console.log("Testing Supabase auth...");

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Auth test failed:", error.message);
      return false;
    }

    console.log("✅ Auth test successful!");
    console.log("Session:", session ? "Active" : "No session");
    return true;
  } catch (error) {
    console.error("❌ Auth test error:", error.message);
    return false;
  }
};
