# 🧪 Testing Documentation

This document provides comprehensive information about the testing setup for the Course Marketplace application.

## 📋 Test Overview

The application includes comprehensive tests for all Supabase operations, covering:

- **Database Operations** - All CRUD operations for courses, categories, lessons, enrollments, progress, and reviews
- **Authentication Operations** - User registration, login, logout, password management, and profile updates
- **Supabase Configuration** - Connection testing, client setup, and utility functions
- **Integration Tests** - End-to-end user journeys and data consistency

## 🏗️ Test Structure

```
__tests__/
├── database.test.js          # Database operations tests
├── auth.test.js              # Authentication tests
├── supabase.test.js          # Supabase configuration tests
├── test-connection.test.js   # Connection testing utilities
├── integration.test.js       # Integration tests
├── login.test.js             # UI login tests
├── signup.test.js            # UI signup tests
├── email-confirmation.test.js # Email confirmation tests
├── navigation.test.js        # Navigation tests
└── role-based-signup.test.js # Role-based signup tests
```

## 🚀 Running Tests

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Supabase Tests Only

```bash
npm run test:supabase
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

### CI Mode

```bash
npm run test:ci
```

## 📊 Test Coverage

### Database Operations (`database.test.js`)

#### Course Operations

- ✅ `getCourses()` - Fetch published courses with filters
- ✅ `getCourseById()` - Fetch single course by ID
- ✅ `getCourseBySlug()` - Fetch course by slug
- ✅ Error handling for course operations

#### Category Operations

- ✅ `getCategories()` - Fetch all categories
- ✅ `getCategoryBySlug()` - Fetch category by slug
- ✅ Error handling for category operations

#### Lesson Operations

- ✅ `getLessonsByCourseId()` - Fetch lessons for a course
- ✅ Error handling for lesson operations

#### Enrollment Operations

- ✅ `enrollInCourse()` - Create new enrollment
- ✅ `getUserEnrollments()` - Fetch user enrollments
- ✅ Error handling for enrollment operations

#### Progress Operations

- ✅ `updateLessonProgress()` - Upsert lesson progress
- ✅ `getLessonProgress()` - Fetch lesson progress
- ✅ Graceful handling of not found progress
- ✅ Error handling for progress operations

#### Review Operations

- ✅ `getCourseReviews()` - Fetch course reviews
- ✅ `createReview()` - Create new review
- ✅ Error handling for review operations

### Authentication Operations (`auth.test.js`)

#### User Registration

- ✅ `signUp()` - Create new user account
- ✅ Error handling for registration failures
- ✅ Edge cases (empty email, weak password, invalid email)

#### User Login

- ✅ `signIn()` - Authenticate user
- ✅ Error handling for authentication failures

#### Session Management

- ✅ `getSession()` - Get current session
- ✅ `onAuthStateChange()` - Auth state listener
- ✅ Error handling for session operations

#### Password Management

- ✅ `resetPassword()` - Send password reset email
- ✅ `updatePassword()` - Update user password
- ✅ Error handling for password operations

#### Profile Management

- ✅ `updateProfile()` - Update user profile
- ✅ Error handling for profile operations

### Supabase Configuration (`supabase.test.js`)

#### Client Configuration

- ✅ Environment variable validation
- ✅ Client creation with proper parameters
- ✅ Error handling for missing environment variables

#### Utility Functions

- ✅ `getCurrentUser()` - Get authenticated user
- ✅ `getUserProfile()` - Get user profile
- ✅ `isAdmin()` - Check admin role
- ✅ `isInstructor()` - Check instructor role
- ✅ Error handling for utility functions

### Connection Testing (`test-connection.test.js`)

#### Database Connection

- ✅ `testSupabaseConnection()` - Test database connectivity
- ✅ Error handling for connection failures
- ✅ Timeout scenarios
- ✅ Malformed responses

#### Authentication Testing

- ✅ `testAuth()` - Test authentication service
- ✅ Session state handling
- ✅ Error handling for auth failures
- ✅ Timeout scenarios

### Integration Tests (`integration.test.js`)

#### Complete User Journey

- ✅ User registration and login
- ✅ Course browsing and enrollment
- ✅ Progress tracking and reviews
- ✅ Profile management

#### Instructor Journey

- ✅ Instructor registration
- ✅ Course management
- ✅ Permission checking

#### Admin Journey

- ✅ Admin authentication
- ✅ System overview
- ✅ User management

#### Error Handling

- ✅ Database connection failures
- ✅ Authentication failures
- ✅ Profile not found scenarios

#### Data Consistency

- ✅ Cross-operation data integrity
- ✅ Related record consistency

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

- Uses Next.js Jest configuration
- JSDOM test environment
- Coverage collection from all source files
- Module name mapping for imports

### Test Setup (`jest.setup.js`)

- Global mocks for Next.js components
- Environment variable setup
- Browser API mocks (localStorage, sessionStorage, fetch)
- Global test utilities and mock data helpers

### Mock Data Helpers

The test setup includes global helper functions for creating consistent mock data:

```javascript
// Available global helpers
createMockUser(overrides);
createMockProfile(overrides);
createMockCourse(overrides);
createMockCategory(overrides);
createMockLesson(overrides);
createMockEnrollment(overrides);
createMockProgress(overrides);
createMockReview(overrides);
createMockSession(overrides);
```

## 🐛 Debugging Tests

### Verbose Output

```bash
npm test -- --verbose
```

### Single Test File

```bash
npm test -- database.test.js
```

### Single Test Case

```bash
npm test -- -t "should fetch published courses"
```

### Debug Mode

```bash
npm test -- --detectOpenHandles --forceExit
```

## 📈 Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

## 🔍 Test Best Practices

### 1. Mock External Dependencies

All Supabase operations are mocked to ensure tests are fast and reliable.

### 2. Test Error Scenarios

Every function includes tests for both success and error cases.

### 3. Use Descriptive Test Names

Test names clearly describe what is being tested and expected behavior.

### 4. Clean Up After Tests

Each test cleans up mocks and test data to prevent interference.

### 5. Test Edge Cases

Tests include edge cases like empty data, invalid inputs, and timeout scenarios.

## 🚨 Common Issues

### 1. Environment Variables

Ensure `.env.local` file exists with proper Supabase credentials for manual testing.

### 2. Mock Conflicts

If tests fail due to mock conflicts, clear mocks between tests using `jest.clearAllMocks()`.

### 3. Async Operations

All database operations are async - ensure proper `await` usage in tests.

### 4. Timeout Issues

Tests have a 10-second timeout. For long-running operations, increase timeout or optimize.

## 📝 Adding New Tests

### 1. Database Operations

Add tests to `database.test.js` following the existing pattern:

```javascript
describe("New Operation", () => {
  test("should perform operation successfully", async () => {
    // Test implementation
  });

  test("should handle errors", async () => {
    // Error test implementation
  });
});
```

### 2. Authentication Operations

Add tests to `auth.test.js` following the existing pattern.

### 3. Integration Tests

Add tests to `integration.test.js` for end-to-end scenarios.

### 4. New Test Files

Create new test files following the naming convention: `feature.test.js`

## 🔗 Related Documentation

- [Supabase Setup Guide](../SUPABASE_SETUP.md)
- [Database Schema](../tables.md)
- [Product Requirements](../prd.md)
- [Pages Documentation](../pages.md)

## 🤝 Contributing

When adding new features or modifying existing ones:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve test coverage
4. Update this documentation if needed
5. Run integration tests to verify end-to-end functionality

## 📞 Support

For testing-related issues:

1. Check the test output for specific error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Review the test setup and configuration
5. Check for mock conflicts or timing issues
