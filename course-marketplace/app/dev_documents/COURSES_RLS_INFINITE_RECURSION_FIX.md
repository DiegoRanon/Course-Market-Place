# Courses Table RLS Infinite Recursion Fix

## Issue

We encountered an infinite recursion error in the Row Level Security (RLS) policies for the `courses` table:

```
Error fetching featured courses: {
  code: '42P17',
  details: null,
  hint: null,
  message: 'infinite recursion detected in policy for relation "courses"'
}
```

This happens when RLS policies create circular references, typically when a policy for the `courses` table references the `courses` table itself or another table whose policies reference back to `courses`.

## Root Cause

The infinite recursion occurs due to circular references in the RLS policies. Common causes include:

1. A policy on the `courses` table that references the `profiles` table
2. A policy on the `profiles` table that references the `courses` table
3. Self-referential policies that query the same table they're protecting

For example:

```sql
-- ❌ PROBLEMATIC POLICY - Can cause infinite recursion
CREATE POLICY "Creators can create courses" ON courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'creator'
    )
  );
```

When this policy is triggered, it queries the `profiles` table, which might have its own policies that query back to `courses`, creating an infinite loop.

## Solution

We've fixed this by replacing circular references with JWT claims that don't require querying other tables:

```sql
-- ✅ FIXED POLICY - Uses JWT claims instead of table queries
CREATE POLICY "Creators can create courses" ON courses
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('creator', 'admin')
  );
```

## Implementation

The fix has been implemented in two files:

1. **SQL Script**: `app/dev_documents/FIX_COURSES_INFINITE_RECURSION.sql`

   - Contains SQL commands to drop and recreate all RLS policies for the `courses` table
   - Uses JWT claims instead of table queries for role-based checks

2. **JavaScript Runner**: `fix-courses-infinite-recursion.js`
   - Node.js script to execute the SQL commands using the Supabase admin API
   - Includes verification steps to ensure the fix works

## How to Apply the Fix

### Option 1: Run the JavaScript Script (Recommended)

This requires the `SUPABASE_SERVICE_ROLE_KEY` environment variable to be set.

```bash
# Make sure dotenv is installed
npm install dotenv

# Run the script
node fix-courses-infinite-recursion.js
```

### Option 2: Run the SQL Directly in Supabase

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `app/dev_documents/FIX_COURSES_INFINITE_RECURSION.sql`
4. Run the SQL

## Verification

After applying the fix, you should no longer see the infinite recursion error when:

1. Fetching published courses
2. Creating new courses as a creator
3. Updating courses as a creator or admin
4. Viewing course details

## Technical Details

### JWT Claims Structure

The JWT contains user metadata that includes the role:

```json
{
  "user_metadata": {
    "role": "creator",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Correct JWT Syntax

The correct syntax for accessing JWT claims in Supabase RLS policies is:

```sql
-- ✅ CORRECT - With proper type casting
(auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'

-- ❌ INCORRECT - Missing type casting
(auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin'
```

## Security Considerations

- **JWT must be up-to-date**: Ensure user metadata is updated when roles change
- **Token refresh**: Users may need to sign out/in to get updated JWT after role changes
- **Metadata sync**: Keep JWT metadata in sync with database roles

## Related Issues

This fix is related to the creator profile access issue we previously addressed. Both involve RLS policies and proper access control.

## Testing

To verify the fix works correctly, we can run:

```bash
# Test fetching published courses
node -e "const { supabase } = require('./app/lib/supabase'); async function test() { const { data, error } = await supabase.from('courses').select('id, title').eq('status', 'published').limit(3); console.log('Courses:', data, 'Error:', error); } test();"
```
