# Deployment Guide for Course Marketplace

This document outlines the deployment setup for the Course Marketplace application.

## Deployment Platform: Vercel

The application is deployed to Vercel, which provides seamless integration with Next.js applications.

### Setup Instructions

1. Create a Vercel account at https://vercel.com
2. Connect your GitHub repository to Vercel
3. Configure the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Any other environment variables required by the application

### GitHub Actions Integration

The repository includes a GitHub Actions workflow that:

1. Runs tests on every push to main and every pull request
2. Automatically deploys to Vercel when changes are pushed to the main branch

For this to work, you need to set up the following secrets in your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel personal access token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: The ID of your Vercel project

### Vercel Configuration

The vercel.json file in the repository configures:

- The build and development commands
- Git branch deployment preferences
- Environment-specific behavior

### Preview Deployments

Every pull request will generate a preview deployment with its own URL, allowing you to test changes before merging.

### Production Deployment

Changes pushed to the main branch will automatically be deployed to production after passing tests.

## Manual Deployment

To manually deploy the application:

1. Install Vercel CLI: `npm i -g vercel`
2. Log in to Vercel: `vercel login`
3. Deploy the application: `vercel --prod`

## Monitoring

After deployment, monitor the application's performance using:

- Vercel Analytics
- Real User Monitoring (RUM)
- Server logs
