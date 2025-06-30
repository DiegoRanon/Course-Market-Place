const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log("Checking database structure...");

  try {
    // Check if tables exist
    console.log("Checking tables...");

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    console.log("Profiles table:", profilesError ? "ERROR" : "OK");

    // Check courses table
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .limit(1);

    console.log("Courses table:", coursesError ? "ERROR" : "OK");

    // Check sections table
    const { data: sections, error: sectionsError } = await supabase
      .from("sections")
      .select("*")
      .limit(1);

    console.log("Sections table:", sectionsError ? "ERROR" : "OK");

    // Check lessons table
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .limit(1);

    console.log("Lessons table:", lessonsError ? "ERROR" : "OK");

    // Check enrollments table
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("*")
      .limit(1);

    console.log("Enrollments table:", enrollmentsError ? "ERROR" : "OK");

    // Check progress table
    const { data: progress, error: progressError } = await supabase
      .from("progress")
      .select("*")
      .limit(1);

    console.log("Progress table:", progressError ? "ERROR" : "OK");

    // Check reviews table
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*")
      .limit(1);

    console.log("Reviews table:", reviewsError ? "ERROR" : "OK");

    // Check categories table
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .limit(1);

    console.log("Categories table:", categoriesError ? "ERROR" : "OK");

    // Check if RLS is enabled
    console.log("\nChecking RLS policies...");

    // Try to access courses as anonymous user (should be restricted)
    const { data: coursesAnon, error: coursesAnonError } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .limit(1);

    console.log(
      "RLS for published courses:",
      coursesAnonError ? "ERROR" : "Accessible (Expected)"
    );

    console.log("\nDatabase check complete!");
  } catch (error) {
    console.error("Error checking database:", error.message);
  }
}

checkDatabase();
