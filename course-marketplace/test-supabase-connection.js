// test-supabase-connection.js
// Simple script to test Supabase connection and check for infinite recursion

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env file"
  );
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log("Testing Supabase connection...");

  try {
    // Test fetching courses
    console.log("Fetching courses...");
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title, status")
      .eq("status", "published")
      .limit(3);

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);

      // Check if it's an infinite recursion error
      if (
        coursesError.code === "42P17" &&
        coursesError.message.includes("infinite recursion")
      ) {
        console.error(
          "DETECTED: Infinite recursion in courses table RLS policies!"
        );
        console.log(
          "Please run the fix script or apply the SQL fixes in FIX_COURSES_INFINITE_RECURSION.sql"
        );
      }
    } else {
      console.log("Successfully fetched courses:", courses);
    }

    // Try fetching profiles
    console.log("\nFetching profiles...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .limit(3);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);

      // Check if it's an infinite recursion error
      if (
        profilesError.code === "42P17" &&
        profilesError.message.includes("infinite recursion")
      ) {
        console.error(
          "DETECTED: Infinite recursion in profiles table RLS policies!"
        );
        console.log(
          "Please run the fix script or apply the SQL fixes in fix-infinite-recursion.sql"
        );
      }
    } else {
      console.log("Successfully fetched profiles:", profiles);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

// Run the test
testConnection();
