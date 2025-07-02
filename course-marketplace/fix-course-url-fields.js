// Script to update the courses table to use the correct field names for thumbnail_url and video_url
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
    console.log("Starting migration to update course URL fields...");

    // Read the SQL file
    const sqlFilePath = path.join(
      __dirname,
      "app",
      "dev_documents",
      "UPDATE_COURSE_URL_FIELDS.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Split the SQL content into separate statements
    const statements = sqlContent
      .replace(/--.*$/gm, "") // Remove comments
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing SQL statement: ${statement.substring(0, 50)}...`);

      const { data, error } = await supabase.rpc("exec_sql", {
        sql: statement,
      });

      if (error) {
        console.error(`Error executing statement: ${error.message}`);
      } else {
        console.log("Statement executed successfully");
      }
    }

    console.log("Migration completed successfully");

    // Verify the columns exist
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "courses")
      .in("column_name", ["thumbnail_url", "video_url"]);

    if (columnsError) {
      console.error("Error verifying columns:", columnsError.message);
    } else {
      console.log(
        "Columns in courses table:",
        columns.map((col) => col.column_name).join(", ")
      );
    }
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  }
}

runMigration();
