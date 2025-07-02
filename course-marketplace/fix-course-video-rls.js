// Script to fix RLS policies for course videos
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: Missing Supabase URL or service role key in environment variables"
  );
  console.error(
    "Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRlsPolicies() {
  try {
    console.log("Starting RLS policy fixes for course videos...");

    // Read the SQL file
    const sqlPath = path.join(
      process.cwd(),
      "app",
      "dev_documents",
      "FIX_COURSE_VIDEO_RLS.sql"
    );
    console.log(`Reading SQL file from: ${sqlPath}`);

    if (!fs.existsSync(sqlPath)) {
      console.error(`Error: SQL file not found at ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log(`Successfully read SQL file (${sql.length} bytes)`);

    // Split the SQL into individual statements
    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter(
        (statement) => statement.length > 0 && !statement.startsWith("--")
      );

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(
          `${statement.substring(0, 100)}${statement.length > 100 ? "..." : ""}`
        );

        // Execute the SQL statement
        const { data, error } = await supabase.rpc("exec_sql", {
          sql: statement,
        });

        if (error) {
          console.error(`❌ Error executing statement: ${error.message}`);
          console.log("Statement:", statement);
          errorCount++;
        } else {
          console.log("✅ Statement executed successfully");
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception executing statement: ${err.message}`);
        console.log("Statement:", statement);
        errorCount++;
      }
    }

    console.log("\n--- RLS Policy Fix Summary ---");
    console.log(`Total statements: ${statements.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errorCount}`);

    // Verify the policies
    console.log("\nVerifying current policies...");
    const { data: policies, error: policiesError } = await supabase.rpc(
      "exec_sql",
      {
        sql: "SELECT tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'courses' OR (tablename = 'objects' AND qual LIKE '%course-videos%')",
      }
    );

    if (policiesError) {
      console.error("❌ Error verifying policies:", policiesError);
    } else if (!policies || policies.length === 0) {
      console.log("⚠️ No policies found for courses or course videos");
    } else {
      console.log("✅ Current policies:");
      console.table(policies);
    }

    console.log("\nRLS policy fixes for course videos completed");
  } catch (error) {
    console.error("❌ Error fixing RLS policies:", error);
    process.exit(1);
  }
}

// Run the function
console.log("=== Course Video RLS Policy Fix Tool ===");
fixRlsPolicies()
  .then(() => console.log("Script completed successfully"))
  .catch((err) => {
    console.error("Script failed with error:", err);
    process.exit(1);
  });
