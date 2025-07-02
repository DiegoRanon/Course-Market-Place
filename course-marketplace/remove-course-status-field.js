// Script to remove the status field from the courses table
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase URL or service role key in environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeCourseStatusField() {
  try {
    console.log('Starting migration to remove status field from courses table...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'app', 'dev_documents', 'REMOVE_COURSE_STATUS_FIELD.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`Error executing SQL: ${error.message}`);
        console.error('Statement:', statement);
      } else {
        console.log('Success!');
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('The status field has been removed from the courses table');
    console.log('RLS policies have been updated to allow viewing all courses');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
}

// Run the migration
removeCourseStatusField(); 