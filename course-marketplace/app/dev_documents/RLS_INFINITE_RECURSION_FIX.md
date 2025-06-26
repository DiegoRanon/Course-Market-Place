# 🔧 RLS Infinite Recursion Fix

## Problem Description

You're experiencing an infinite recursion error when trying to fetch profiles:

```
Error fetching profile: {
  code: '42P17', 
  message: 'infinite recursion detected in policy for relation "profiles"'
}
```

## Root Cause

The infinite recursion occurs because the RLS (Row Level Security) policies for the `profiles` table reference the `profiles` table itself within the policy conditions. This creates a circular dependency:

```sql
-- ❌ PROBLEMATIC POLICY - Causes infinite recursion
create policy "Admins can view all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles  -- ← This queries the same table!
      where id = auth.uid() and role = 'admin'
    )
  );
```

When a user tries to fetch their profile:
1. The policy checks if they're an admin by querying the `profiles` table
2. This triggers the same policy again
3. Which queries the `profiles` table again
4. Creating an infinite loop

## Solution

Replace the circular references with JWT claims that don't require querying the `profiles` table:

```sql
-- ✅ FIXED POLICY - Uses JWT claims instead of table queries
create policy "Admins can view all profiles" on profiles
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );
```

## Quick Fix

Run this SQL in your Supabase SQL Editor:

```sql
-- Fix RLS Policies for Profiles Table - Fix Infinite Recursion
-- Run this in your Supabase SQL Editor

-- First, drop existing policies if they exist
drop policy if exists "Users can create own profile" on profiles;
drop policy if exists "Allow profile creation during signup" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;

-- Create new profiles policies without infinite recursion
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can create own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Allow profile creation during signup" on profiles
  for insert with check (true);

-- Fixed JWT claims syntax for admin policies
create policy "Admins can view all profiles" on profiles
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

create policy "Admins can update all profiles" on profiles
  for update using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );
```

## Comprehensive Fix

For a complete fix of all tables, use the `FIX_ALL_RLS_POLICIES.sql` file which addresses infinite recursion in all tables.

## How JWT Claims Work

### Before (Problematic)
```sql
-- Queries the profiles table to check role
exists (
  select 1 from profiles
  where id = auth.uid() and role = 'admin'
)
```

### After (Fixed)
```sql
-- Uses JWT claims directly with proper type casting
(auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
```

## JWT Claims Structure

The JWT contains user metadata that includes the role:

```json
{
  "user_metadata": {
    "role": "admin",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## Important: Correct JWT Syntax

The correct syntax for accessing JWT claims in Supabase RLS policies is:

```sql
-- ✅ CORRECT - With proper type casting
(auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'

-- ❌ INCORRECT - Missing type casting
(auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin'
```

The `::jsonb` cast is required because:
1. `auth.jwt() ->> 'user_metadata'` returns a text value
2. We need to cast it to `jsonb` to use the `->>` operator again
3. This allows us to extract the `role` field from the JSON object

## Security Considerations

### ✅ Benefits of JWT Claims Approach
- **No infinite recursion**: JWT claims don't require database queries
- **Better performance**: No additional database lookups
- **Consistent**: Role information is always available in the JWT
- **Atomic**: Role check happens in a single operation

### ⚠️ Important Notes
- **JWT must be up-to-date**: Ensure user metadata is updated when roles change
- **Token refresh**: Users may need to sign out/in to get updated JWT
- **Metadata sync**: Keep JWT metadata in sync with database
- **Correct syntax**: Always use `::jsonb` casting for nested JWT claims

## Testing the Fix

Run the test suite to verify the fix:

```bash
npm test __tests__/rls-infinite-recursion.test.js
```

## Verification Steps

1. **Run the fix SQL** in Supabase SQL Editor
2. **Test profile fetching** in your application
3. **Verify admin access** works correctly
4. **Check all tables** for similar issues

## Common Tables Affected

The infinite recursion issue commonly affects these tables:
- `profiles` - Most common
- `categories` - Admin policies
- `courses` - Admin policies
- `lessons` - Admin policies
- `enrollments` - Admin policies
- `progress` - Admin policies
- `purchases` - Admin policies
- `reviews` - Admin policies
- `contact_messages` - Admin policies
- `newsletter_subscriptions` - Admin policies

## Alternative Solutions

### 1. Service Role Approach
Use a service role with elevated permissions for admin operations:

```javascript
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### 2. Server-Side API Routes
Handle admin operations in server-side API routes:

```javascript
// app/api/admin/profiles/route.js
export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  // Admin logic here
}
```

### 3. Function-Based Policies
Use database functions for complex policy logic:

```sql
create function is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = user_id and role = 'admin'
  );
end;
$$ language plpgsql security definer;

create policy "Admins can view all profiles" on profiles
  for select using (is_admin(auth.uid()));
```

## Troubleshooting

### Issue: Still getting infinite recursion
**Solution**: Check if all policies were dropped and recreated correctly:
```sql
select * from pg_policies where tablename = 'profiles';
```

### Issue: Admin access not working
**Solution**: Verify JWT contains correct role metadata:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log(user.user_metadata.role);
```

### Issue: Role not updating in JWT
**Solution**: Update user metadata and refresh session:
```javascript
await supabase.auth.updateUser({
  data: { role: 'admin' }
});
```

### Issue: Operator does not exist: text ->> unknown
**Solution**: Use proper type casting in JWT claims:
```sql
-- ✅ Correct
(auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'

-- ❌ Incorrect
(auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin'
```

## Best Practices

1. **Always use JWT claims** for role-based policies
2. **Use proper type casting** (`::jsonb`) for nested JWT claims
3. **Avoid circular references** in RLS policies
4. **Test policies thoroughly** before deployment
5. **Monitor for performance issues** with complex policies
6. **Keep JWT metadata in sync** with database state

## Related Files

- `FIX_RLS_POLICIES.sql` - Basic profiles table fix
- `FIX_ALL_RLS_POLICIES.sql` - Comprehensive fix for all tables
- `__tests__/rls-infinite-recursion.test.js` - Test suite
- `RLS_TROUBLESHOOTING.md` - General RLS troubleshooting

## Support

If you continue to have issues:
1. Check the Supabase logs for detailed error messages
2. Verify your environment variables are correct
3. Test with a fresh user account
4. Check the browser console for additional error details 