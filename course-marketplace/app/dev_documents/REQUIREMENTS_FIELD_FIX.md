# Requirements Field Fix

## Issue

When creating a course, the following error occurred:

```
Error: Error creating course: Could not find the 'requirements' column of 'courses' in the schema cache
```

This error happens because the `requirements` field is referenced in the code but doesn't exist in the database schema.

## Root Cause

The `requirements` field is used in the `CourseForm.js` component to store course requirements as an array, but the corresponding column doesn't exist in the `courses` table in the database.

## Solution

We implemented a two-part solution:

### 1. Immediate Fix (Workaround)

Modified the `CourseForm.js` component to handle the missing requirements field by:

- Storing requirements as a JSON string in a temporary field called `requirements_json`
- Adding error handling to catch the "requirements column not found" error
- Retrying the course creation without the requirements field if the error occurs
- Appending the requirements to the course description as a workaround

Modified the `createCourse` function in `courses.js` to:

- Check for the presence of `requirements_json` field
- If present, append the requirements to the description field
- Remove the `requirements_json` field before sending to the database

This allows courses to be created successfully even without the requirements column in the database.

### 2. Permanent Fix (Database Migration)

Created a SQL migration script (`ADD_REQUIREMENTS_FIELD.sql`) to:

- Add the `requirements` column to the `courses` table as a JSONB type
- Update RLS policies to include the new column
- Create a migration function to extract requirements from the description field for existing courses

Created a JavaScript script (`fix-requirements-field.js`) to run the SQL migration against the Supabase database.

### 3. Additional Cleanup

- Removed the `what_you_will_learn` field from the form since it doesn't exist in the database
- Simplified the form data structure to only include fields that are actually used in the database

## Implementation Details

### CourseForm.js Changes

- Modified the `handleSubmit` function to use `requirements_json` instead of `requirements`
- Added error handling specific to the requirements field
- Added retry logic to create courses without the requirements field if needed
- Removed the unused `what_you_will_learn` field from the form and form data

### courses.js API Changes

- Updated the `createCourse` function to handle the `requirements_json` field
- Added logic to append requirements to the description field if the column doesn't exist

### Database Migration

The SQL migration script:

1. Checks if the requirements column already exists
2. Adds the column as JSONB type if it doesn't exist
3. Updates RLS policies to include the new column
4. Creates a function to migrate existing requirements from description field
5. Executes the migration function
6. Cleans up by dropping the migration function

## How to Apply the Fix

1. Run the immediate fix by deploying the updated code:

   - Updated CourseForm.js
   - Updated courses.js API

2. Apply the database migration:

   ```
   node fix-requirements-field.js
   ```

3. Verify the fix by creating a new course with requirements.

## Testing

The fix was tested by:

1. Creating a course without the database migration (verifying the workaround)
2. Running the database migration
3. Creating a course after the migration (verifying the permanent fix)

Both approaches successfully allow courses to be created with requirements.

## Future Considerations

- Consider adding database schema validation during development to catch similar issues earlier
- Implement a more robust migration system for database schema changes
- Add more comprehensive error handling for database schema mismatches
- Review all form fields to ensure they match the database schema
