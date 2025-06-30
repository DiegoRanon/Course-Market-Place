const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  console.log("Testing RLS policies for infinite recursion...");

  try {
    // Test 1: Get published courses (should work for anonymous users)
    console.log("\n--- Test 1: Get published courses ---");
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .limit(5);

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
    } else {
      console.log(`Success! Fetched ${courses.length} published courses`);
      console.log("First course:", courses[0] || "No courses found");
    }

    // Test 2: Get profiles (should fail for anonymous users)
    console.log("\n--- Test 2: Get profiles (should fail) ---");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(5);

    if (profilesError) {
      console.log("Expected error (correct behavior):", profilesError.message);
    } else {
      console.warn("Warning: Anonymous users can access profiles!");
      console.log(`Fetched ${profiles.length} profiles`);
    }

    // Test 3: Check RLS is enabled
    console.log("\n--- Test 3: Check RLS is enabled ---");
    const { data: rlsData, error: rlsError } = await supabase.rpc(
      "check_rls_enabled",
      { table_name: "profiles" }
    );

    if (rlsError) {
      console.error("Error checking RLS:", rlsError);
    } else {
      console.log("RLS check result:", rlsData);
    }

    console.log("\nTests completed!");
  } catch (error) {
    console.error("Test failed with exception:", error);
  }
}

// Create the RPC function to check if RLS is enabled
async function createRLSCheckFunction() {
  try {
    const { error } = await supabase.rpc("create_rls_check_function", {
      sql: `
        CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
        RETURNS jsonb AS $$
        DECLARE
          result jsonb;
        BEGIN
          EXECUTE format('
            SELECT jsonb_build_object(
              ''table'', %L,
              ''rls_enabled'', relrowsecurity
            ) FROM pg_class WHERE relname = %L;
          ', table_name, table_name) INTO result;
          RETURN result;
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    if (error) {
      console.error("Error creating RLS check function:", error);
    } else {
      console.log("RLS check function created successfully");
    }
  } catch (err) {
    console.error("Failed to create RLS check function:", err);
  }
}

// Run the tests
async function main() {
  // First try to create the RLS check function
  await createRLSCheckFunction();

  // Then run the tests
  await testRLS();
}

main();
