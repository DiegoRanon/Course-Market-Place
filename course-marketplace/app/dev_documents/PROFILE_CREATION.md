# Profile Creation Implementation

## Overview

The signup process creates profile records in the database with the appropriate roles:

1. **Regular Student Signup** (`/signup`) - Creates profiles with default "student" role
2. **Admin Accounts** - Created directly in the database by administrators
3. **Creator Accounts** - Created via creator signup page with "creator" role

## Implementation Details

### AuthProvider Profile Creation

The `AuthProvider` component handles profile creation automatically when a user signs up:

```javascript
const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });

  if (error) throw error;

  // Profile will be created when email is confirmed
  // This avoids RLS policy issues during signup
  console.log("User signed up successfully. Profile will be created after email confirmation.");

  return data;
};
```

### Email Confirmation Profile Creation

Profiles are now created during email confirmation to handle RLS policy issues:

```javascript
// In api/auth/confirm-email/route.js
if (data.user) {
  try {
    // Get user metadata to determine role
    const userMetadata = data.user.user_metadata || {};
    const role = userMetadata.role || "student";
    
    // Create profile record
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      first_name: userMetadata.first_name || "",
      last_name: userMetadata.last_name || "",
      full_name: userMetadata.full_name || "",
      description: userMetadata.description || "",  // Store the creator description
      role: role,
      status: "active",
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }
  } catch (profileError) {
    console.error("Error creating profile:", profileError);
  }
}
```

### Regular Student Signup

**File**: `app/signup/page.js`

The regular signup page creates `userData` without a role field:

```javascript
const userData = {
  first_name: formData.firstName.trim(),
  last_name: formData.lastName.trim(),
  full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
  // No role field - defaults to "student"
};
```

**Result**: Profile created with `role: "student"` during email confirmation

### Creator Signup

**File**: `app/signup/creator/page.js`

The creator signup page explicitly includes the creator role and description:

```javascript
const userData = {
  first_name: formData.firstName.trim(),
  last_name: formData.lastName.trim(),
  full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
  role: "creator", // Set role to creator
  description: formData.description.trim(), // Store creator's description
};
```

**Result**: Profile created with `role: "creator"` and description during email confirmation

### Admin Account Creation

Admin accounts are now created directly in the database by administrators. See the `ADMIN_SETUP.md` document for detailed instructions.

## Database Schema

The profiles table structure supports this implementation:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  full_name text,
  bio text,
  description text, -- For storing creator descriptions
  role text check (role in ('admin', 'creator', 'student')) default 'student',
  status text check (status in ('active', 'inactive')) default 'active',
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## Testing

### Test Files Created

1. **`__tests__/profile-creation.test.js`** - Unit tests for profile creation functionality
2. **`__tests__/profile-integration.test.js`** - Integration tests for complete signup flows
3. **`__tests__/creator-signup.test.js`** - Tests for creator signup functionality

### Test Coverage

- ✅ Regular signup creates profile with student role
- ✅ Creator signup creates profile with creator role and description
- ✅ Role assignment logic works correctly
- ✅ Data consistency across signup process
- ✅ Profile creation error handling

### Running Tests

```bash
# Run all profile-related tests
npm test __tests__/profile-creation.test.js __tests__/profile-integration.test.js __tests__/creator-signup.test.js

# Run specific test files
npm test __tests__/creator-signup.test.js
```

## Security Features

1. **Role Validation**: Database constraint ensures only valid roles are accepted
2. **Default Role**: New users default to "student" (lowest privilege)
3. **Admin Control**: Admin accounts can only be created by database administrators
4. **Strong Passwords**: Admin accounts should use strong password policies

## User Flow

### Student Signup Flow
1. User visits `/signup`
2. Fills out registration form
3. Submits form
4. User receives confirmation email
5. User confirms email
6. Profile created with `role: "student"`
7. User redirected to dashboard

### Creator Signup Flow
1. User visits `/signup/creator`
2. Fills out registration form including creator description
3. Submits form
4. User receives confirmation email
5. User confirms email
6. Profile created with `role: "creator"` and description
7. User redirected to dashboard
8. Admin assigns courses to the creator
9. Creator can access statistics for their assigned courses

### Admin Account Creation Flow
1. Administrator accesses the database directly
2. Creates user account or updates existing user
3. Sets `role: "admin"` in the profiles table
4. Admin can now access admin functionality and create courses

## Future Considerations

1. **Creator Management**: Admin panel should include functionality to assign courses to creators
2. **Role Management**: Admin panel could include role management functionality
3. **Audit Logging**: Consider logging role changes for security
4. **Email Verification**: Ensure all accounts require email verification regardless of role 