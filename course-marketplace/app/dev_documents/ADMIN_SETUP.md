# Admin Account Setup Guide

## Admin Signup Page

The admin signup page is available at `/signup/admin` and provides a secure way to create administrative accounts.

### Features

- **Enhanced Security**: Requires admin access code (currently: `ADMIN2024`)
- **Strong Password Requirements**: Minimum 8 characters with uppercase, lowercase, and numbers
- **Role Assignment**: Automatically assigns admin role to the created account
- **Secure UI**: Warning messages and clear privilege descriptions

### Access

Navigate to: `http://localhost:3000/signup/admin`

### Admin Access Code

The current admin access code is `ADMIN2024`. In production, this should be:
1. Stored as an environment variable
2. Regularly rotated
3. Shared only with authorized personnel

### Security Features

1. **Access Code Protection**: Prevents unauthorized admin account creation
2. **Strong Password Policy**: Enforces robust password requirements
3. **Clear Warnings**: Users are informed about elevated privileges
4. **Masked Inputs**: All sensitive fields use password-type inputs

### Account Privileges

Admin accounts have the following capabilities:
- Full control over content, users, and analytics
- Access to admin panel at `/admin`
- User management functionality
- Course management and oversight
- System analytics and reporting

### Testing

Run the admin signup tests with:
```bash
npm test __tests__/admin-signup.test.js
```

### Production Considerations

1. **Environment Variables**: Move the access code to environment variables
2. **Logging**: Add audit logging for admin account creation
3. **Rate Limiting**: Implement rate limiting on the signup endpoint
4. **Email Verification**: Ensure admin accounts also require email verification
5. **Multi-Factor Authentication**: Consider requiring MFA for admin accounts

### Creating Instructor Accounts

As specified in the requirements, instructor accounts should be created directly in the database rather than through a signup form. Use the admin panel or database management tools to create instructor accounts. 