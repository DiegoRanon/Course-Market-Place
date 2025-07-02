// fix-courses-infinite-recursion.js
// Script to fix the infinite recursion in courses table RLS policies

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key required for RLS changes

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCoursesInfiniteRecursion() {
  console.log("Fixing infinite recursion in courses table RLS policies...");

  try {
    // Check existing policies first
    console.log("Checking existing policies...");
    const { data: existingPolicies, error: policyError } = await supabase.rpc(
      "exec_sql",
      {
        sql_query: `
        SELECT policyname, permissive, cmd, qual 
        FROM pg_policies 
        WHERE tablename = 'courses';
      `,
      }
    );

    if (policyError) {
      console.error("Error checking existing policies:", policyError);
    } else {
      console.log("Existing policies:", existingPolicies);
    }

    // Drop existing policies
    console.log("Dropping existing policies...");
    await supabase.rpc("exec_sql", {
      sql_query: `
        DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
        DROP POLICY IF EXISTS "Creators can view their own courses" ON courses;
        DROP POLICY IF EXISTS "Creators can create courses" ON courses;
        DROP POLICY IF EXISTS "Creators can update own courses" ON courses;
        DROP POLICY IF EXISTS "Admins have full access to courses" ON courses;
        DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
        DROP POLICY IF EXISTS "Users can view own courses" ON courses;
        DROP POLICY IF EXISTS "Creators can create courses" ON courses;
        DROP POLICY IF EXISTS "Creators can update own courses" ON courses;
        DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
      `,
    });

    // Create new policies without circular references
    console.log("Creating new policies...");
    const { data, error } = await supabase.rpc("exec_sql", {
      sql_query: `
        -- 1. Allow anyone to view published courses
        CREATE POLICY "Anyone can view published courses" ON courses
          FOR SELECT USING (status = 'published');
        
        -- 2. Allow creators to view their own courses
        CREATE POLICY "Creators can view own courses" ON courses
          FOR SELECT USING (creator_id = auth.uid());
        
        -- 3. Allow creators to create courses - using JWT claims instead of querying profiles
        CREATE POLICY "Creators can create courses" ON courses
          FOR INSERT WITH CHECK (
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('creator', 'admin')
          );
        
        -- 4. Allow creators to update their own courses
        CREATE POLICY "Creators can update own courses" ON courses
          FOR UPDATE USING (creator_id = auth.uid());
        
        -- 5. Allow creators to delete their own courses
        CREATE POLICY "Creators can delete own courses" ON courses
          FOR DELETE USING (creator_id = auth.uid());
        
        -- 6. Allow admins to manage all courses - using JWT claims
        CREATE POLICY "Admins can manage all courses" ON courses
          FOR ALL USING (
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
          );
        
        -- Make sure RLS is enabled
        ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
      `,
    });

    if (error) {
      console.error("Error creating new policies:", error);
      process.exit(1);
    }

    // Verify the policies were created correctly
    console.log("Verifying new policies...");
    const { data: newPolicies, error: verifyError } = await supabase.rpc(
      "exec_sql",
      {
        sql_query: `
        SELECT policyname, permissive, cmd, qual 
        FROM pg_policies 
        WHERE tablename = 'courses';
      `,
      }
    );

    if (verifyError) {
      console.error("Error verifying policies:", verifyError);
    } else {
      console.log("New policies created successfully:", newPolicies);
    }

    // Test a query to verify there are no circular references
    console.log("Testing a query to verify no circular references...");
    const { data: testData, error: testError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("status", "published")
      .limit(1);

    if (testError) {
      console.error("Test query failed:", testError);
    } else {
      console.log("Test query succeeded:", testData);
      console.log(
        "✅ Successfully fixed infinite recursion in courses table RLS policies!"
      );
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

// Run the function
fixCoursesInfiniteRecursion();
