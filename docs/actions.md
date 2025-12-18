# GitHub Actions CI/CD Pipeline

This document explains the automated CI/CD pipeline that deploys the fullstack Cloudflare application to production on every push to the `main` branch.

## Overview

The pipeline is defined in [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) and runs on GitHub Actions. It automatically:

- Generates semantic version numbers for each deployment
- Builds the entire monorepo (frontend + backend)
- Runs database migrations on Cloudflare D1
- Configures secrets for Workers and Pages
- Deploys the backend to Cloudflare Workers
- Deploys the frontend to Cloudflare Pages
- Provides production URLs for both services

## Pipeline Structure

### Trigger
- **Event**: Push to `main` branch
- **Environment**: `production` (requires approval for protected environments)

### Single Job: `deploy`
Runs on `ubuntu-latest` with Node.js 20 and pnpm 8.

#### Steps Breakdown

1. **Checkout Code**
   - Uses `actions/checkout@v4` to clone the repository

2. **Generate Semantic Version**
   - Creates version string in format: `1.0.{RUN_NUMBER}+{SHA}.{TIMESTAMP}`
   - Example: `1.0.42+abc1234.202512181430`
   - Sets `BUILD_VERSION` environment variable for use in deployments

3. **Setup Tools**
   - Installs pnpm v8
   - Sets up Node.js 20 with pnpm caching

4. **Install Dependencies**
   - Runs `pnpm install --frozen-lockfile` for reproducible builds

5. **Build Application**
   - Runs `pnpm run build` (uses Turborepo to build both apps in parallel)

6. **Run D1 Migrations**
   - Changes to `apps/backend/` directory
   - Executes migration files on the remote D1 database:
     - `0001_create_users_table.sql`
     - `0002_create_todos_table.sql`
   - Uses `--remote` flag to target production database

7. **Set Worker Secrets**
   - Sets `FIREBASE_PROJECT_ID` and `BUILD_VERSION` secrets for the Worker
   - Uses `--env=""` to target production environment
   - Continues if secrets already exist (`|| true`)

8. **Deploy Backend**
   - Deploys the Worker using `wrangler deploy --env=""`
   - Captures the production Worker URL
   - Sets `BACKEND_URL` environment variable for frontend

9. **Set Pages Secrets**
   - Sets multiple secrets for the Pages project:
     - `VITE_API_URL`: Points to the deployed Worker URL
     - `VITE_BUILD_VERSION`: Semantic version for the frontend
     - Firebase configuration variables (API key, auth domain, etc.)
   - Uses `--project-name fullstack-frontend`
   - Continues if secrets already exist

9. **Deploy Frontend**
   - Deploys built frontend to Cloudflare Pages
   - Uses `--branch=main` for production deployment
   - Includes `--commit-dirty=true` and commit message for tracking
   - Outputs both deployment URL and production alias

## Required GitHub Secrets

The pipeline requires these secrets to be configured in your GitHub repository:

### Cloudflare Authentication
- `CLOUDFLARE_API_TOKEN`: API token with Workers and Pages permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### Worker Secrets
- `FIREBASE_PROJECT_ID`: Firebase project identifier

### Pages Secrets
- `VITE_API_URL`: Auto-set to Worker URL (doesn't need manual config)
- `VITE_BUILD_VERSION`: Auto-set semantic version (doesn't need manual config)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID

## Cloudflare Configuration

### D1 Database
- Pre-create the database: `wrangler d1 create todo-db`
- Update `apps/backend/wrangler.toml` with the correct `database_id`
- The pipeline assumes the database exists and runs migrations on it

### Pages Project
- Create a Pages project named `fullstack-frontend`
- Set production branch to `main` in Pages settings
- The pipeline will deploy to production automatically

### Workers Project
- Project name: `fullstack-backend` (defined in `wrangler.toml`)
- Environment: Production (top-level config)

## Semantic Versioning

The pipeline automatically generates semantic version numbers for each deployment using the format:

```
1.0.{RUN_NUMBER}+{SHA}.{TIMESTAMP}
├── Major ──┼── Minor ──┼── Patch ──┼── Build Metadata
```

**Components**:
- **Major**: `1` (base version, manually updated for breaking changes)
- **Minor**: `0` (manually updated for new features)
- **Patch**: `{RUN_NUMBER}` (GitHub Actions run number, auto-increments)
- **Build Metadata**: `{SHA}.{TIMESTAMP}` (Git commit SHA + build timestamp)

**Example**: `1.0.42+abc1234.202512181430`

**Usage**:
- **Backend**: Available as `BUILD_VERSION` environment variable in Workers
- **Frontend**: Available as `VITE_BUILD_VERSION` environment variable in React app
- **API Responses**: Included in all API endpoint responses
- **UI Display**: Shown in app footer for user visibility

## Environment Variables

The pipeline uses these environment variables during execution:

- `CLOUDFLARE_API_TOKEN`: For Wrangler authentication
- `CLOUDFLARE_ACCOUNT_ID`: Account context
- `BACKEND_URL`: Set during backend deployment, used for frontend secrets

## Error Handling

- **Secret Conflicts**: Pipeline continues if secrets already exist
- **Build Failures**: Stops pipeline immediately
- **Deployment Failures**: Stops pipeline with error details
- **URL Extraction**: Uses regex to capture deployment URLs from Wrangler output

## Monitoring & Debugging

### GitHub Actions Logs
- View pipeline runs in the "Actions" tab of your repository
- Each step provides detailed logs from Wrangler commands
- Failed steps show error codes and messages

### Cloudflare Dashboard
- **Workers**: Check deployment status and logs
- **Pages**: View deployment history and production URL
- **D1**: Monitor database queries and size

### Common Issues

1. **Authentication Errors**: Check API token permissions
2. **Secret Conflicts**: Remove existing secrets if needed
3. **Database Errors**: Ensure D1 database exists and migrations are valid
4. **Build Failures**: Check Node.js version (requires v20+)

## Manual Overrides

If needed, you can still deploy manually:

```bash
# Backend
cd apps/backend
wrangler deploy --env=""

# Frontend
cd apps/frontend
pnpm run build
wrangler pages deploy dist --project-name fullstack-frontend --branch=main
```

## Security Considerations

- Secrets are encrypted in GitHub and only accessible during pipeline runs
- API tokens have minimal required permissions
- Production environment requires approval for protected deployments
- No sensitive data is logged in pipeline output

## Performance

- **Runtime**: ~2-3 minutes for full deployment
- **Caching**: pnpm dependencies are cached between runs
- **Parallelization**: Turborepo builds frontend and backend simultaneously
- **Optimization**: Single job eliminates redundant setup steps

## Future Enhancements

Potential improvements:
- Add automated testing before deployment
- Include linting and type checking
- Add deployment status notifications (Slack, etc.)
- Implement blue-green deployments
- Add rollback capabilities