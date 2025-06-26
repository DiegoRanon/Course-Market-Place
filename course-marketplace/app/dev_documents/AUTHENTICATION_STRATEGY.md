# Authentication Strategy

## Overview

This document outlines the authentication strategy for the Course Marketplace platform, focusing on different user roles and their creation processes.

## User Roles

The platform supports three user roles:

1. **Student** - Default role for all users who sign up through the regular signup process
2. **Creator** - Can access statistics for their assigned courses (courses are created for them by admins)
3. **Admin** - Has full access to the platform, including user management and course creation

## Authentication Flow

### Regular User (Student) Authentication

1. User signs up through the `/signup` page
2. User receives confirmation email
3. User confirms email
4. Profile is created with `role: "student"`
5. User can now access student-specific functionality

### Creator Authentication

1. User signs up through the `/signup/creator` page
2. User fills in standard signup fields plus a description of their expertise
3. User receives confirmation email
4. User confirms email
5. Profile is created with `role: "creator"` and their description
6. Creator can now access their statistics dashboard, but cannot create courses
7. Admins will create and assign courses to the creator

### Admin Account Creation

Admin accounts are created **directly in the database** rather than through a signup form. This approach:

1. Increases security by limiting admin account creation
2. Provides better control over administrative access
3. Avoids exposing admin signup endpoints

See `ADMIN_SETUP.md` for detailed instructions on creating admin accounts.

## Technical Implementation

- **Authentication Provider**: Supabase Authentication
- **User Management**: Supabase Auth + Custom profiles table
- **Session Management**: Client-side session with `AuthProvider` context
- **Access Control**: Role-based access control via the `profiles.role` field
- **Creator Descriptions**: Stored in the `profiles.description` field

## Security Features

1. **Email Verification**: All users must verify their email before gaining access
2. **Role Verification**: Admin routes check for admin role before allowing access
3. **Row Level Security**: Database rules ensure users can only access their own data
4. **JWT Validation**: All authenticated requests validate JWT tokens

## Best Practices

1. **Never** create admin accounts through regular signup flows
2. **Always** use the database directly for creating privileged accounts
3. **Ensure** all authentication flows pass through email verification
4. **Implement** proper access controls on all protected routes and API endpoints

## Further Reading

- See `ADMIN_SETUP.md` for admin account creation details
- See `PROFILE_CREATION.md` for profile creation implementation details
- See `RLS_POLICIES.sql` for database security policies 