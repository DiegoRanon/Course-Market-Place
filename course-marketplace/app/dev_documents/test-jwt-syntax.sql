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
    when (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' in ('creator', 'admin') 
    then 'Creator or Admin access granted'
    else 'Access denied'
  end as multi_role_check;

-- Test 4: Null handling
select 
  coalesce((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'student') as role_with_default;

-- Note: These tests will only work if you're authenticated
-- If you're not authenticated, auth.jwt() will return null 

-- This is a test file for JWT syntax in Supabase RLS policies

-- Function to test JWT access
CREATE OR REPLACE FUNCTION test_jwt_access()
RETURNS TABLE (
  test_name text,
  result text
) AS $$
BEGIN
  -- Test basic JWT access
  RETURN QUERY
  SELECT 
    'Basic JWT Access' as test_name,
    CASE 
      WHEN auth.jwt() IS NOT NULL 
      THEN 'JWT accessible'
      ELSE 'JWT not accessible'
    END as result;
  
  -- Test role-based access
  RETURN QUERY
  SELECT 
    'Role-Based Access' as test_name,
    CASE 
      WHEN (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
      THEN 'Admin access granted'
      WHEN (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' in ('creator', 'admin')
      THEN 'Creator or Admin access granted'
      WHEN (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'student'
      THEN 'Student access granted'
      ELSE 'Unknown role'
    END as result;
  
  -- Test custom claims
  RETURN QUERY
  SELECT 
    'Custom Claims' as test_name,
    CASE 
      WHEN auth.jwt() ->> 'app_metadata' IS NOT NULL
      THEN 'Custom claims accessible: ' || (auth.jwt() ->> 'app_metadata')
      ELSE 'No custom claims found'
    END as result;
END;
$$ LANGUAGE plpgsql;

-- Example RLS policy using JWT
CREATE POLICY "Users can access based on JWT role"
ON some_table
FOR SELECT
USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'creator' AND creator_id = auth.uid() THEN true
    WHEN auth.jwt() ->> 'role' = 'student' AND is_public = true THEN true
    ELSE false
  END
);

-- Example function to check role from JWT
CREATE OR REPLACE FUNCTION is_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = required_role OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql; 