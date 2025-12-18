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
   - Creates version string in format: `{BASE_VERSION}+{RUN_NUMBER}.{SHA}.{TIMESTAMP}`
   - Example: `1.0.0+42.abc1234.202512181430`
   - Sets `BUILD_VERSION` environment variable for use in deployments

3. **Set Pages Secrets (Build-time)**
   - Sets Firebase configuration secrets needed during Vite build
   - These secrets are for Cloudflare Pages runtime but need to be set early
   - Firebase variables (API key, auth domain, project ID, etc.)
   - Uses `--project-name fullstack-frontend`

4. **Setup Tools**
   - Installs pnpm v8
   - Sets up Node.js 20 with pnpm caching

5. **Install Dependencies**
   - Runs `pnpm install --frozen-lockfile` for reproducible builds

6. **Build Application**
   - Runs `pnpm run build` (uses Turborepo to build both apps in parallel)
   - **Critical**: All `VITE_*` environment variables are passed during build
   - Environment variables embedded in this step:
     - `VITE_BUILD_VERSION`: Semantic version for display
     - `VITE_API_URL`: Backend API endpoint
     - `VITE_FIREBASE_*`: All Firebase configuration (8 variables)
   - Vite embeds these values into the client-side bundle during compilation
   - Values are hardcoded in the built JavaScript files

7. **Run D1 Migrations**
   - Changes to `apps/backend/` directory
   - Executes migration files on the remote D1 database:
     - `0001_create_users_table.sql`
     - `0002_create_todos_table.sql`
   - Uses `--remote` flag to target production database

8. **Set Worker Secrets**
   - Sets `FIREBASE_PROJECT_ID` and `BUILD_VERSION` secrets for the Worker
   - Uses `--env=""` to target production environment
   - Continues if secrets already exist (`|| true`)

9. **Deploy Backend**
   - Deploys the Worker using `wrangler deploy --env=""`
   - Captures the production Worker URL
   - Sets `BACKEND_URL` environment variable for frontend

10. **Set Pages Secrets (Runtime)**
    - Sets runtime secrets after backend deployment:
      - `VITE_API_URL`: Points to the deployed Worker URL
      - `VITE_BUILD_VERSION`: Semantic version for runtime access
    - These are for Cloudflare Pages runtime environment
    - Not used during build (values already embedded in step 6)

11. **Deploy Frontend**
    - Deploys built frontend to Cloudflare Pages
    - **No `--branch` flag**: Direct Upload deploys to production by default
    - Includes `--commit-dirty=true` and commit message for tracking
    - Outputs both deployment URL and production alias
    - Deploys to `https://fullstack-frontend.pages.dev`

## Required GitHub Secrets

The pipeline requires these secrets to be configured in your GitHub repository:

### Cloudflare Authentication
- `CLOUDFLARE_API_TOKEN`: API token with Workers and Pages permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### Worker Secrets
- `FIREBASE_PROJECT_ID`: Firebase project identifier

### Build-time Secrets (Embedded by Vite)
These secrets are passed as environment variables during the build step and embedded into the client-side JavaScript bundle:

- `VITE_API_URL`: Backend API URL (e.g., `https://fullstack-backend.devdaviddr.workers.dev`)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID

**Note**: The `VITE_BUILD_VERSION` is auto-generated during the pipeline and doesn't need to be manually configured.

## Cloudflare Configuration

### D1 Database
- Pre-create the database: `wrangler d1 create todo-db`
- Update `apps/backend/wrangler.toml` with the correct `database_id`
- The pipeline assumes the database exists and runs migrations on it

### Pages Project
- Create a Pages project named `fullstack-frontend`
- **Production deployment**: Remove any branch-specific configuration
- With Direct Upload (our method), deployments without a `--branch` flag go to production
- Preview deployments happen only when a branch is explicitly specified
- The pipeline will deploy to `https://fullstack-frontend.pages.dev` automatically

### Workers Project
- Project name: `fullstack-backend` (defined in `wrangler.toml`)
- Environment: Production (top-level config)

## Semantic Versioning

The pipeline automatically generates semantic version numbers for each deployment using the format:

```
{BASE_VERSION}+{RUN_NUMBER}.{SHA}.{TIMESTAMP}
├── Base Version ──┼── Build ──┼── Git ──┼── Time
```

**Components**:
- **Base Version**: Read from `VERSION` file (e.g., `1.0.0`, `1.1.0`, `2.0.0`)
- **Build Number**: GitHub Actions run number (auto-increments per deployment)
- **Git SHA**: Short commit hash for traceability
- **Timestamp**: Build date/time for uniqueness

**Example**: `1.1.0+42.abc1234.202512181430`

### Version Bumping

To bump major or minor versions, update the `VERSION` file in your repository root:

```bash
# For minor version bump (new features)
echo "1.1.0" > VERSION

# For major version bump (breaking changes)
echo "2.0.0" > VERSION

# Then commit and push
git add VERSION
git commit -m "chore: bump version to 1.1.0"
git push origin main
```

**Version Guidelines**:
- **Major** (`X.0.0`): Breaking changes, API changes
- **Minor** (`1.X.0`): New features, backward compatible
- **Patch** (`1.0.X`): Bug fixes, auto-incremented by CI/CD

**Usage**:
- **Backend**: Available as `BUILD_VERSION` environment variable in Workers
- **Frontend**: Available as `VITE_BUILD_VERSION` environment variable in React app
- **API Responses**: Included in all API endpoint responses
- **UI Display**: Shown in app footer for user visibility

## Environment Variables

The pipeline uses these environment variables during execution:

### GitHub Actions Environment
- `CLOUDFLARE_API_TOKEN`: For Wrangler authentication
- `CLOUDFLARE_ACCOUNT_ID`: Account context
- `BUILD_VERSION`: Generated semantic version
- `BACKEND_URL`: Set during backend deployment, used for Pages runtime secrets

### Build-time Environment Variables (Step 6)
All `VITE_*` variables are passed to the build process and embedded into the frontend bundle:
- `VITE_BUILD_VERSION`: Semantic version string
- `VITE_API_URL`: Backend API endpoint URL
- `VITE_FIREBASE_API_KEY`: Firebase configuration
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase configuration
- `VITE_FIREBASE_PROJECT_ID`: Firebase configuration
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase configuration
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase configuration
- `VITE_FIREBASE_APP_ID`: Firebase configuration
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase configuration

**Important**: These values are hardcoded into the JavaScript bundle during build. Changes require a rebuild and redeployment.

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
5. **Frontend Shows "localhost:8788"**: `VITE_API_URL` secret not set in GitHub
6. **Firebase Errors in Production**: Firebase `VITE_*` secrets not set in GitHub
7. **Version Not Showing**: `VITE_BUILD_VERSION` not passed to build step
8. **Preview URL Instead of Production**: `--branch` flag was used (should be removed)

## Manual Overrides

If needed, you can still deploy manually:

```bash
# Backend
cd apps/backend
wrangler deploy --env=""

# Frontend (with environment variables)
cd apps/frontend
export VITE_API_URL="https://fullstack-backend.devdaviddr.workers.dev"
export VITE_BUILD_VERSION="dev"
# Set all VITE_FIREBASE_* variables
pnpm run build
wrangler pages deploy dist --project-name fullstack-frontend
```

**Note**: Direct Upload without `--branch` deploys to production. Add `--branch=preview` for preview deployments.

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