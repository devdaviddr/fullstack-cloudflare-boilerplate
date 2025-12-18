# Deploying to Cloudflare

This guide explains how to manually deploy the fullstack Cloudflare boilerplate application to Cloudflare's platform.

**Note**: A deployment script `deploy.sh` is available in the project root for automated deployment. However, this guide covers the manual steps for better understanding and troubleshooting.

## Prerequisites

Before deploying, ensure you have:

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com) if you haven't already
2. **Wrangler CLI**: Install the Cloudflare CLI tool
   ```bash
   npm install -g wrangler
   ```
3. **Cloudflare Authentication**: Log in to your account
   ```bash
   wrangler auth login
   ```
4. **Node.js and pnpm**: Ensure you have Node.js installed and pnpm as the package manager

## Project Structure

This is a monorepo with:
- `apps/backend/` - Cloudflare Worker (API)
- `apps/frontend/` - React SPA (deployed to Cloudflare Pages)

## Step 1: Set Up Cloudflare Resources

### 1.1 Create D1 Database

Create a D1 database for your application:

```bash
# Create the database
wrangler d1 create todo-db

# Note the database_id from the output - you'll need this for wrangler.toml
```

### 1.2 Create KV Namespace (Optional)

If your app uses KV storage:

```bash
# Create KV namespace
wrangler kv:namespace create "MY_KV_NAMESPACE"

# Note the namespace IDs for production and preview environments
```

### 1.3 Create R2 Bucket (Optional)

If your app uses R2 storage:

```bash
# Create R2 bucket
wrangler r2 bucket create my-bucket
```

## Step 2: Configure Environment

### 2.1 Update Backend Configuration

Edit `apps/backend/wrangler.toml` and update the following:

```toml
# Replace with your actual database ID
[[d1_databases]]
binding = "DB"
database_name = "todo-db"
database_id = "your-actual-database-id"

# Replace with your actual KV namespace IDs
[[kv_namespaces]]
binding = "MY_KV_NAMESPACE"
id = "your-production-namespace-id"
preview_id = "your-preview-namespace-id"

# Update R2 bucket name if using
[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "your-bucket-name"
```

### 2.2 Set Environment Variables

Set required environment variables for your backend:

```bash
# For production
wrangler secret put FIREBASE_PROJECT_ID

# Add other secrets as needed
wrangler secret put YOUR_SECRET_NAME
```

Or set them in the Cloudflare Dashboard under your Worker settings.

## Step 3: Deploy Backend (Cloudflare Worker)

### 3.1 Run Database Migrations

Before deploying, run the database migrations:

```bash
cd apps/backend

# Run migrations on your remote D1 database
wrangler d1 execute todo-db --file=./migrations/0001_create_users_table.sql
wrangler d1 execute todo-db --file=./migrations/0002_create_todos_table.sql
```

### 3.2 Deploy the Worker

```bash
cd apps/backend
wrangler deploy
```

This will:
- Build your Worker
- Deploy it to Cloudflare's edge network
- Provide you with a deployment URL (e.g., `https://your-worker.your-subdomain.workers.dev`)

**Note the Worker URL** - you'll need it for the frontend configuration.

## Step 4: Deploy Frontend (Cloudflare Pages)

### 4.1 Build the Frontend

```bash
cd apps/frontend
npm run build
```

This creates a `dist/` directory with the production build.

### 4.2 Configure API URL

The frontend is configured to use the `VITE_API_URL` environment variable for the backend URL. Set this as a Pages secret:

```bash
wrangler pages secret put VITE_API_URL --project-name your-pages-project
# Enter your deployed Worker URL when prompted: https://your-worker.your-subdomain.workers.dev
```

This ensures the frontend calls the correct backend without hardcoding URLs in the code.

### 4.3 Deploy to Cloudflare Pages

```bash
# From the frontend directory
wrangler pages deploy dist --compatibility-date 2024-01-01
```

Or from the project root:

```bash
wrangler pages deploy apps/frontend/dist --compatibility-date 2024-01-01
```

This will:
- Upload your built frontend to Cloudflare Pages
- Provide you with a Pages URL (e.g., `https://your-project.pages.dev`)

## Step 5: Configure Custom Domain (Optional)

### 5.1 For Cloudflare Pages

1. Go to your Cloudflare Dashboard
2. Navigate to Pages → your project
3. Go to Custom domains
4. Add your custom domain

### 5.2 For Cloudflare Worker

1. Go to your Cloudflare Dashboard
2. Navigate to Workers & Pages → your worker
3. Go to Triggers → Custom Domains
4. Add your custom domain

## Step 6: Environment Variables for Frontend

If your frontend needs environment variables (e.g., Firebase config), set them in Cloudflare Pages:

1. Go to Pages → your project → Settings → Environment variables
2. Add your variables (they'll be available as `import.meta.env.VITE_*`)

## Step 7: Testing Deployment

### 7.1 Test Backend

```bash
# Test your Worker endpoints
curl https://your-worker.your-subdomain.workers.dev/api/health
```

### 7.2 Test Frontend

Visit your Pages URL and ensure:
- The app loads correctly
- API calls work (check browser network tab)
- Authentication works (if implemented)

## Troubleshooting

### Common Issues

**1. Database Connection Issues**
- Ensure your D1 database ID is correct in `wrangler.toml`
- Run migrations on the correct database instance

**2. CORS Issues**
- Check your Worker's CORS configuration in `apps/backend/src/middleware/index.ts`
- Ensure the frontend domain is allowed in the `origin` function
- For Cloudflare Pages domains (*.pages.dev), the CORS should automatically allow them
- If you get "Access-Control-Allow-Origin header has wrong value", redeploy the backend after checking the CORS code

**3. Environment Variables**
- Use `wrangler secret put` for sensitive data
- Use `wrangler pages secret put` for Pages environment variables

**4. Build Failures**
- Ensure all dependencies are installed: `pnpm install`
- Check for TypeScript errors: `npm run typecheck`

### Useful Commands

```bash
# Check deployment status
wrangler tail  # View Worker logs
wrangler pages deployment tail  # View Pages logs

# List your resources
wrangler d1 list
wrangler kv:namespace list
wrangler r2 bucket list

# Update environment variables
wrangler secret put VARIABLE_NAME
wrangler pages secret put VARIABLE_NAME
```

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database Guide](https://developers.cloudflare.com/d1/)

