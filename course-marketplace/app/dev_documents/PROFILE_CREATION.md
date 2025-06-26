# Profile Creation Implementation

## Overview

Both signup pages now properly create profile records in the database with the appropriate roles:

1. **Regular Student Signup** (`/signup`) - Creates profiles with default "student" role
2. **Admin Signup** (`/signup/admin`) - Creates profiles with "admin" role

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

  // Create profile record if signup is successful
  if (data.user) {
    try {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        full_name: userData.full_name,
        role: userData.role || "student", // Defaults to "student" if no role provided
        status: "active",
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    } catch (profileError) {
      console.error("Error creating profile:", profileError);
    }
  }

  return data;
};
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

**Result**: Profile created with `role: "student"`

### Admin Signup

**File**: `app/signup/admin/page.js`

The admin signup page explicitly includes the admin role:

```javascript
const userData = {
  first_name: formData.firstName.trim(),
  last_name: formData.lastName.trim(),
  full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
  role: "admin", // Explicitly set admin role
};
```

**Result**: Profile created with `role: "admin"`

## Database Schema

The profiles table structure supports this implementation:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  full_name text,
  bio text,
  role text check (role in ('admin', 'instructor', 'student')) default 'student',
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

### Test Coverage

- ✅ Regular signup creates profile with student role
- ✅ Admin signup creates profile with admin role
- ✅ Role assignment logic works correctly
- ✅ Data consistency across both signup types
- ✅ Profile creation error handling

### Running Tests

```bash
# Run all profile-related tests
npm test __tests__/profile-creation.test.js __tests__/profile-integration.test.js

# Run specific test files
npm test __tests__/profile-creation.test.js
npm test __tests__/profile-integration.test.js
```

## Security Features

1. **Role Validation**: Database constraint ensures only valid roles are accepted
2. **Default Role**: New users default to "student" (lowest privilege)
3. **Admin Access Code**: Admin signup requires special access code
4. **Strong Passwords**: Admin accounts require stronger password policies

## User Flow

### Student Signup Flow
1. User visits `/signup`
2. Fills out registration form
3. Submits form
4. AuthProvider creates user account
5. AuthProvider creates profile with `role: "student"`
6. User redirected to email confirmation

### Admin Signup Flow
1. User visits `/signup/admin`
2. Fills out admin registration form (including access code)
3. Submits form
4. AuthProvider creates user account
5. AuthProvider creates profile with `role: "admin"`
6. User redirected to email confirmation

## Future Considerations

1. **Instructor Creation**: As specified, instructor accounts should be created directly in the database
2. **Role Management**: Admin panel could include role management functionality
3. **Audit Logging**: Consider logging role changes for security
4. **Email Verification**: Ensure all accounts require email verification regardless of role 