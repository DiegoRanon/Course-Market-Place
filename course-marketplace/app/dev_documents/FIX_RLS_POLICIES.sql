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

-- Test the policies
-- This should work now for both authenticated and unauthenticated profile creation 