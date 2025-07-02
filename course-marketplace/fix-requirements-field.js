// Script to add the requirements field to the courses table
// This script reads the SQL file and executes it using the Supabase client

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase URL or key. Make sure your environment variables are set correctly."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log(
      "Starting migration to add requirements field to courses table..."
    );

    // Read the SQL file
    const sqlFilePath = path.join(
      __dirname,
      "app",
      "dev_documents",
      "ADD_REQUIREMENTS_FIELD.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Execute the SQL
    console.log("Executing SQL migration...");
    const { data, error } = await supabase.rpc("exec_sql", { sql: sqlContent });

    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }

    console.log("Migration completed successfully!");
    console.log("Requirements field has been added to the courses table.");

    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Run the migration
runMigration()
  .then((result) => {
    if (result.success) {
      console.log("✅ Migration completed successfully");
      process.exit(0);
    } else {
      console.error("❌ Migration failed:", result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
