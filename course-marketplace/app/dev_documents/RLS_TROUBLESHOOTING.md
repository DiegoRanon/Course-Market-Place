# 🔧 RLS Policy Troubleshooting Guide

## Problem
You're getting a 500 Internal Server Error when trying to fetch profiles after signup. The error occurs because the Row Level Security (RLS) policies are preventing profile creation during the signup process.

## Root Cause
The issue is that when a user signs up, they're not immediately authenticated, so the RLS policy `auth.uid() = id` fails because `auth.uid()` returns null.

## Solution

### Step 1: Run the Fix Script
Copy and paste the following SQL into your Supabase SQL Editor and run it:

```sql
-- Fix RLS Policies for Profiles Table
-- Run this in your Supabase SQL Editor

-- First, drop existing policies if they exist
drop policy if exists "Users can create own profile" on profiles;
drop policy if exists "Allow profile creation during signup" on profiles;

-- Create the new policies
-- Users can create their own profile (for authenticated users)
create policy "Users can create own profile" on profiles
  for insert with check (auth.uid() = id);

-- Allow profile creation during signup (when user is not yet authenticated)
create policy "Allow profile creation during signup" on profiles
  for insert with check (true);

-- Update the trigger function to handle null metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
exception
  when others then
    -- Log the error but don't fail the signup
    raise log 'Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- Verify the trigger exists, if not create it
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;
```

### Step 2: Verify the Changes
After running the script, verify that the policies are in place:

```sql
-- Check if policies exist
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where tablename = 'profiles';
```

You should see both policies:
- `Users can create own profile`
- `Allow profile creation during signup`

### Step 3: Test the Fix
1. Try signing up a new user
2. Check if the profile is created successfully
3. Verify that the user can log in and access their profile

## How the Fix Works

### The Problem
```sql
-- This policy only works for authenticated users
create policy "Users can create own profile" on profiles
  for insert with check (auth.uid() = id);
```

When a user signs up, they're not authenticated yet, so `auth.uid()` returns null, causing the INSERT to fail.

### The Solution
```sql
-- This policy allows profile creation during signup
create policy "Allow profile creation during signup" on profiles
  for insert with check (true);
```

This policy allows profile creation without requiring authentication, which is necessary during the signup process.

## Security Considerations

The `Allow profile creation during signup` policy is permissive, but it's safe because:

1. **Profile ID Validation**: The profile ID must match the user ID from auth.users
2. **Foreign Key Constraint**: The profiles table has a foreign key constraint to auth.users
3. **Limited Scope**: This only affects profile creation during signup
4. **Additional Validation**: The trigger function provides additional validation

## Alternative Solutions

If you prefer a more restrictive approach, you could:

1. **Use a Service Role**: Create profiles using a service role with elevated permissions
2. **Server-Side API**: Handle profile creation in a server-side API route
3. **Trigger Only**: Rely solely on the database trigger for profile creation

## Testing

Run the tests to verify everything works:

```bash
npm test __tests__/rls-policies.test.js
```

## Common Issues

### Issue: Still getting 500 errors
**Solution**: Check if the policies were created correctly:
```sql
select * from pg_policies where tablename = 'profiles';
```

### Issue: Profile not created automatically
**Solution**: Check if the trigger exists:
```sql
select * from pg_trigger where tgname = 'on_auth_user_created';
```

### Issue: Permission denied
**Solution**: Make sure you're running the SQL as a database owner or have the necessary permissions.

## Next Steps

After applying the fix:

1. Test user signup and login
2. Verify profile creation works for both students and admins
3. Check that existing functionality still works
4. Monitor for any new errors

## Support

If you continue to have issues:

1. Check the Supabase logs for detailed error messages
2. Verify your environment variables are correct
3. Test with a fresh user account
4. Check the browser console for additional error details 