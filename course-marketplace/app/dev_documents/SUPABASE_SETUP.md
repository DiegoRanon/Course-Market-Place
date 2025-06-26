# Supabase Setup Guide

This guide will help you set up Supabase for your Course Marketplace application.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `course-marketplace` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:

```bash
cp env.example .env.local
```

2. Update `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Enable Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
3. Save changes

### 5. Set Up Database Tables

The database tables are defined in `tables.md`. You'll need to create these tables in your Supabase SQL editor.

## 📁 Project Structure

```
course-marketplace/
├── lib/
│   ├── supabase.js          # Supabase client configuration
│   ├── auth.js              # Authentication utilities
│   └── database.js          # Database operation utilities
├── components/
│   ├── AuthProvider.js      # Authentication context provider
│   └── ProtectedRoute.js    # Route protection components
├── env.example              # Environment variables template
└── SUPABASE_SETUP.md        # This file
```

## 🔧 Configuration Files

### Supabase Client (`lib/supabase.js`)

- Main Supabase client configuration
- Helper functions for user management
- Role-based access control utilities

### Authentication (`lib/auth.js`)

- Sign up, sign in, sign out functions
- Password reset functionality
- Profile management

### Database Operations (`lib/database.js`)

- Course and category operations
- Enrollment and progress tracking
- Review system functions

### Auth Provider (`components/AuthProvider.js`)

- React context for authentication state
- Automatic session management
- Profile data synchronization

### Protected Routes (`components/ProtectedRoute.js`)

- Route protection based on authentication
- Role-based access control
- Loading states and redirects

## 🛡️ Security Features

### Row Level Security (RLS)

All tables should have RLS enabled with appropriate policies:

```sql
-- Example RLS policy for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Authentication Flow

1. User signs up/signs in
2. Supabase creates auth record
3. Profile record is created/updated
4. Session is maintained across app
5. Protected routes check authentication

## 🔄 Next Steps

1. **Create Database Tables**: Run the SQL from `tables.md` in your Supabase SQL editor
2. **Set Up RLS Policies**: Configure security policies for each table
3. **Test Authentication**: Verify sign up/sign in works
4. **Implement Features**: Start integrating with your existing components

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**

   - Ensure `.env.local` is in the project root
   - Restart your development server
   - Check variable names match exactly

2. **Authentication Errors**

   - Verify site URL in Supabase settings
   - Check redirect URLs configuration
   - Ensure email confirmation is set up correctly

3. **Database Connection Issues**
   - Verify project URL and API key
   - Check if tables exist in Supabase
   - Ensure RLS policies are configured

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js Documentation](https://nextjs.org/docs)

## 📝 Notes

- The `@/` import alias is configured in `jsconfig.json`
- All authentication state is managed through React Context
- Database operations are centralized in utility functions
- Protected routes automatically handle authentication checks
