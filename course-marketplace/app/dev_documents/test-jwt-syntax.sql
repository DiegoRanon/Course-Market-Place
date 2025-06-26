-- Test JWT Claims Syntax
-- Run this in your Supabase SQL Editor to verify the syntax is correct

-- Test 1: Basic JWT extraction
select 
  auth.jwt() as full_jwt,
  auth.jwt() ->> 'user_metadata' as user_metadata_text,
  (auth.jwt() ->> 'user_metadata')::jsonb as user_metadata_json,
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' as role_from_jwt;

-- Test 2: Policy condition simulation
select 
  case 
    when (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' 
    then 'Admin access granted'
    else 'Admin access denied'
  end as access_check;

-- Test 3: Multiple role check
select 
  case 
    when (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' in ('instructor', 'admin') 
    then 'Instructor or Admin access granted'
    else 'Access denied'
  end as multi_role_check;

-- Test 4: Null handling
select 
  coalesce((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'student') as role_with_default;

-- Note: These tests will only work if you're authenticated
-- If you're not authenticated, auth.jwt() will return null 