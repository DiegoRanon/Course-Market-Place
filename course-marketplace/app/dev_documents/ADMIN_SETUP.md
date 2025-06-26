# Admin Account Setup Guide

## Creating Admin Accounts

Admin accounts are created directly in the database rather than through a signup form. This approach provides better security and control over administrative access.

### Process for Creating Admin Accounts

1. **Create Auth User**
   - Use the Supabase dashboard or SQL to create a user in the `auth.users` table
   - Alternatively, allow the user to sign up as a regular user first

2. **Set Admin Role in Profiles Table**
   - After the user is created, update their profile record in the `profiles` table
   - Set the `role` field to `admin`

### Example SQL

```sql
-- Option 1: If creating a new user directly
-- First, create the auth user (requires admin access to Supabase)
SELECT supabase_auth.create_user(
  'admin@example.com',
  'secure_password_here',
  '{"first_name": "Admin", "last_name": "User", "full_name": "Admin User", "role": "admin"}'::jsonb
);

-- Option 2: If updating an existing user
-- Just update the role in the profiles table
UPDATE profiles
SET role = 'admin'
WHERE id = 'existing-user-uuid';
```

### Using Supabase Dashboard

1. Navigate to your Supabase project dashboard
2. Go to **Authentication** → **Users**
3. Create a new user or locate an existing user
4. Go to **Database** → **Table Editor** → **profiles**
5. Find the user's profile record and update their `role` to `admin`

### Security Considerations

1. **Access Control**: Limit who can perform these operations to trusted personnel
2. **Audit Logging**: Keep records of admin user creation
3. **Strong Passwords**: Ensure admin accounts have strong passwords
4. **Email Verification**: Admin accounts should still go through email verification
5. **Multi-Factor Authentication**: Consider requiring MFA for admin accounts

### Account Privileges

Admin accounts have the following capabilities:
- Full control over content, users, and analytics
- Access to admin panel at `/admin`
- User management functionality
- Course management and oversight (including course creation)
- System analytics and reporting

### Testing

You can test admin functionality using:
```bash
npm test __tests__/admin-signup.test.js
```
Note: These tests may need to be updated to reflect the direct database creation approach.

### Creating Creator Accounts

Similarly, creator accounts should also be created directly in the database by setting the `role` field to `creator` in the profiles table. Creators have access to statistics for courses assigned to them but cannot create courses themselves - this is handled by admins. 