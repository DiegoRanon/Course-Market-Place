# Supabase Database Implementation Guide

This document provides step-by-step instructions for implementing the database schema for the Course Marketplace platform in Supabase.

## Prerequisites

1. Access to Supabase project with admin privileges
2. SQL files created for each aspect of the database schema:
   - `IMPLEMENT_USER_AUTH_TABLES.sql`
   - `IMPLEMENT_COURSE_TABLES.sql`
   - `IMPLEMENT_ENROLLMENT_TABLES.sql`
   - `IMPLEMENT_RLS_POLICIES.sql`
   - `OPTIMIZE_DATABASE_PERFORMANCE.sql`

## Implementation Order

Follow this specific order to ensure proper table relationships and avoid dependency issues:

1. User and Authentication Tables
2. Course and Curriculum Tables
3. Enrollment and Progress Tracking Tables
4. Row Level Security Policies
5. Performance Optimizations

## Step 1: Implement User and Authentication Tables

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `IMPLEMENT_USER_AUTH_TABLES.sql`
5. Run the query
6. Verify in the Table Editor that the `profiles` table has been created with the correct columns and constraints

## Step 2: Implement Course and Curriculum Tables

1. Navigate to the SQL Editor
2. Create a new query
3. Copy and paste the contents of `IMPLEMENT_COURSE_TABLES.sql`
4. Run the query
5. Verify in the Table Editor that the following tables have been created:
   - `categories`
   - `courses`
   - `sections`
   - `lessons`

## Step 3: Implement Enrollment and Progress Tracking Tables

1. Navigate to the SQL Editor
2. Create a new query
3. Copy and paste the contents of `IMPLEMENT_ENROLLMENT_TABLES.sql`
4. Run the query
5. Verify in the Table Editor that the following tables have been created:
   - `enrollments`
   - `progress`
   - `reviews`

## Step 4: Implement Row Level Security Policies

1. Navigate to the SQL Editor
2. Create a new query
3. Copy and paste the contents of `IMPLEMENT_RLS_POLICIES.sql`
4. Run the query
5. Verify in the Authentication > Policies section that the RLS policies have been applied to all tables

## Step 5: Optimize Database Performance

1. Navigate to the SQL Editor
2. Create a new query
3. Copy and paste the contents of `OPTIMIZE_DATABASE_PERFORMANCE.sql`
4. Run the query
5. Note: Some features like materialized views and certain extensions may require a Pro or Enterprise plan

## Verification Steps

After implementing all components, perform these verification steps:

### 1. Test User Authentication Flow

1. Create a test user via the Authentication > Users section
2. Verify that a corresponding entry is created in the `profiles` table
3. Check that the RLS policies correctly restrict access based on user role

### 2. Test Course Creation and Access

1. Insert test data into the `categories` table
2. Insert test data into the `courses` table with different statuses
3. Verify that RLS policies correctly restrict access to courses based on status and user role

### 3. Test Enrollment and Progress Tracking

1. Insert test enrollment data
2. Insert test progress data
3. Verify that triggers correctly update course statistics (total students, etc.)
4. Verify that RLS policies correctly restrict access to enrollment and progress data

### 4. Performance Testing

1. Run EXPLAIN ANALYZE on common queries to verify index usage
2. Check that materialized views are properly populated
3. Verify that trigger functions correctly update materialized views

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**:

   - Verify that RLS policies are correctly configured
   - Check that the authenticated user has the appropriate role

2. **Foreign Key Constraint Violations**:

   - Ensure you're creating tables in the correct order
   - Verify that referenced records exist before inserting related records

3. **Trigger Function Errors**:
   - Check for syntax errors in trigger functions
   - Verify that referenced columns and tables exist

### Getting Help

If you encounter issues:

1. Check the Supabase logs in the Dashboard
2. Review the SQL statements for syntax errors
3. Consult the Supabase documentation for RLS and PostgreSQL features
4. Join the Supabase community Discord for assistance

## Maintenance Tasks

After implementation, schedule these regular maintenance tasks:

1. Refresh materialized views daily (can be automated with pg_cron if available)
2. Run ANALYZE on tables weekly to update statistics for the query planner
3. Monitor slow queries and optimize as needed
4. Regularly backup the database

## Next Steps

After implementing the database schema:

1. Set up API endpoints in your Next.js application
2. Create server-side functions for complex operations
3. Implement client-side data fetching with proper error handling
4. Set up authentication hooks to work with Supabase Auth
