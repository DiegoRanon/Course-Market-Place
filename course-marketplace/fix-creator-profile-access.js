// fix-creator-profile-access.js
// Script to add a policy allowing public access to creator profiles for published courses

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCreatorProfileAccessPolicy() {
  console.log("Adding policy to allow public access to creator profiles...");

  try {
    // Execute SQL to add the new policy
    const { data, error } = await supabase.rpc("exec_sql", {
      sql_query: `
        -- Add a policy to allow anyone to view creator profiles of published courses
        DROP POLICY IF EXISTS "Anyone can view creator profiles of published courses" ON profiles;
        
        CREATE POLICY "Anyone can view creator profiles of published courses" ON profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM courses
              WHERE creator_id = profiles.id AND status = 'published'
            )
          );
      `,
    });

    if (error) {
      console.error("Error adding policy:", error);
      return;
    }

    console.log("Policy added successfully!");

    // Verify the policy was created
    const { data: policies, error: policiesError } = await supabase.rpc(
      "exec_sql",
      {
        sql_query: `
        SELECT policyname, permissive, cmd, qual 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        ORDER BY policyname;
      `,
      }
    );

    if (policiesError) {
      console.error("Error verifying policies:", policiesError);
      return;
    }

    console.log("Current profiles policies:", policies);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

// Execute the function
addCreatorProfileAccessPolicy()
  .then(() => console.log("Script completed"))
  .catch((err) => console.error("Script failed:", err));
