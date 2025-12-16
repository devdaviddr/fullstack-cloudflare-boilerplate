# Fullstack Cloudflare Boilerplate

A modern monorepo template for building scalable fullstack applications using React (Vite + TypeScript) for the frontend and Hono (TypeScript) for the backend, deployed on Cloudflare's edge infrastructure.

## What This Boilerplate Provides

This boilerplate gives you a production-ready foundation for building fullstack applications with:

- **Frontend**: React 18 with Vite for fast development and TypeScript for type safety
- **Backend**: Hono framework running on Cloudflare Workers for edge computing
- **API Integration**: Robust error handling, retry logic, and CORS configuration
- **Monorepo Management**: Turborepo for efficient build orchestration and task management
- **Shared Code**: TypeScript types package for consistent interfaces across apps
- **Development Tools**: ESLint, TypeScript, and hot reloading configured
- **Deployment Ready**: Optimized for Cloudflare's ecosystem with environment variable support

## Architecture Overview

### Turborepo Structure

This project uses [Turborepo](https://turbo.build/repo) to manage the monorepo efficiently:

```
fullstack-cloudflare-boilerplate/
├── apps/
│   ├── frontend/     # React + Vite application
│   └── backend/      # Hono API server (Cloudflare Workers)
├── packages/
│   └── types/        # Shared TypeScript definitions
├── package.json      # Root dependencies and scripts
├── pnpm-workspace.yaml # Workspace configuration
└── turbo.json        # Build pipeline configuration
```

**Why Turborepo?**

- **Task Orchestration**: Runs tasks across packages in parallel, respecting dependencies
- **Caching**: Caches build outputs to speed up subsequent runs
- **Dependency Management**: Ensures packages are built in the correct order
- **Workspace Filtering**: Run commands on specific apps/packages with `--filter`

### Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript, ESLint
- **Backend**: Hono, TypeScript, Wrangler (Cloudflare CLI)
- **Build Tools**: Turborepo, pnpm workspaces
- **Deployment**: Cloudflare Workers (backend), Cloudflare Pages (frontend)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (included as dev dependency)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <your-repo-url>
   cd fullstack-cloudflare-boilerplate
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy the frontend environment template
   cp apps/frontend/.env.example apps/frontend/.env
   # Edit apps/frontend/.env with your production API URL when ready to deploy
   ```

3. **Start development servers:**

   ```bash
   pnpm run dev
   ```

   This will start both frontend (http://localhost:5173) and backend development servers concurrently.

4. **Build for production:**

   ```bash
   pnpm run build
   ```

5. **Start development servers:**

   ```bash
   pnpm run dev
   ```

   This will start both frontend (http://localhost:5173) and backend development servers concurrently.

6. **Build for production:**
   ```bash
   pnpm run build
   ```

## Development Workflow

### Available Scripts

Run from the root directory:

```bash
# Development
pnpm run dev          # Start all dev servers
pnpm run dev --filter frontend  # Start only frontend
pnpm run dev --filter backend   # Start only backend

# Building
pnpm run build        # Build all apps
pnpm run build --filter frontend
pnpm run build --filter backend

# Quality checks
pnpm run lint         # Lint all code
pnpm run typecheck    # TypeScript checks
```

### How Turborepo Pipelines Work

The `turbo.json` file defines the build pipeline:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // Build dependencies first
      "outputs": ["dist/**"] // Cache these outputs
    },
    "dev": {
      "cache": false, // Don't cache dev tasks
      "persistent": true // Keep running
    },
    "lint": {}, // Simple task, no dependencies
    "typecheck": {}
  }
}
```

- `^build` means "build dependencies first" - if package A depends on package B, B builds before A
- Outputs are cached to speed up future builds
- Dev tasks run persistently and aren't cached

### Working with Individual Apps

#### Frontend App (`apps/frontend/`)

A React application with:

- Vite for fast development and building
- TypeScript for type safety
- ESLint for code quality
- Hot module replacement (HMR)

**Local Development:**

```bash
pnpm run dev --filter frontend
# Opens http://localhost:5173
```

**Build:**

```bash
pnpm run build --filter frontend
```

#### Backend App (`apps/backend/`)

A Hono API server designed for Cloudflare Workers:

- Edge runtime optimized
- TypeScript support
- Automatic scaling
- Global CDN deployment

**Local Development:**

```bash
pnpm run dev --filter backend
# Starts Wrangler dev server with hot reloading
```

**Deployment:**

```bash
pnpm run deploy --filter backend
```

#### Shared Types (`packages/types/`)

Contains TypeScript interfaces and types shared across apps:

- API response types
- Common data models
- Type definitions

Automatically built when running root commands.

### API Integration & Error Handling

This boilerplate includes robust API integration features:

- **Automatic Retry Logic**: Failed requests are retried with exponential backoff (up to 3 attempts)
- **Smart Error Classification**: Different retry strategies for network errors (5xx) vs client errors (4xx)
- **Enhanced Error UI**: Detailed error messages with status codes and contextual information
- **CORS Configuration**: Properly configured for cross-origin requests in production
- **Environment-Aware API URLs**: Uses development proxy in dev, environment variables in production

## Deployment

### Backend (Cloudflare Workers)

The backend deploys to Cloudflare Workers:

1. **Configure Wrangler:**

   ```bash
   cd apps/backend
   npx wrangler auth login
   ```

2. **Deploy:**
   ```bash
   pnpm run deploy --filter backend
   ```

### Frontend (Cloudflare Pages)

Deploy the frontend to Cloudflare Pages:

1. **Update environment variables:**

   ```bash
   # Edit apps/frontend/.env with your deployed Worker URL
   VITE_API_URL=https://your-worker-name.your-subdomain.workers.dev
   ```

2. **Build the app:**

   ```bash
   pnpm run build --filter frontend
   ```

3. **Deploy via Cloudflare Pages:**
   - Connect your repository to Cloudflare Pages
   - Set build command: `pnpm run build --filter frontend`
   - Set build output directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-worker-name.your-subdomain.workers.dev`

### Environment Variables

Create `.env` files in each app directory:

**Backend (`apps/backend/.env`):**

```bash
MY_VARIABLE=production_value
```

**Frontend (`apps/frontend/.env`):**

```bash
VITE_API_URL=https://your-worker-name.your-subdomain.workers.dev
```

> **Note:** Copy from `apps/frontend/.env.example` and update with your actual Cloudflare Worker URL. In development, the frontend uses a proxy to the local backend. In production, it uses this environment variable to communicate with your deployed Worker.

## Development Tips

### Adding New Dependencies

- **Root dependencies**: `pnpm add -D turbo` (affects all packages)
- **App-specific**: `pnpm add react --filter frontend`
- **Shared packages**: Add to `packages/types/package.json`

### Code Organization

- Keep shared logic in `packages/`
- App-specific code stays in respective `apps/` directories
- Use absolute imports with workspace references: `import { ApiResponse } from '@fullstack/types'`

### Performance

- Turborepo caches build outputs automatically
- Use `turbo prune` to create deployment packages
- Parallel task execution speeds up development

## Contributing

1. Follow the existing code style (ESLint + TypeScript)
2. Run `pnpm run lint` and `pnpm run typecheck` before committing
3. Test changes in both apps
4. Update documentation as needed

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Hono Documentation](https://hono.dev/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
