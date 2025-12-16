# Fullstack Cloudflare Boilerplate

A monorepo template for building fullstack applications with React (Vite + TypeScript) frontend and Hono (TypeScript) backend on Cloudflare.

## Structure

- `apps/frontend/` - React application with Vite and TypeScript
- `apps/backend/` - Hono API server for Cloudflare Workers
- `packages/types/` - Shared TypeScript types

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development servers:
   ```bash
   pnpm run dev
   ```

3. Build for production:
   ```bash
   pnpm run build
   ```

## Scripts

- `pnpm run dev` - Start all development servers
- `pnpm run build` - Build all apps
- `pnpm run lint` - Lint all code
- `pnpm run typecheck` - Run TypeScript checks

## Apps

### Frontend
Located in `apps/frontend/`. A React app built with Vite and TypeScript.

- `pnpm run dev --filter frontend` - Start frontend dev server
- `pnpm run build --filter frontend` - Build frontend

### Backend
Located in `apps/backend/`. A Hono API server for Cloudflare Workers.

- `pnpm run dev --filter backend` - Start backend dev server (Wrangler)
- `pnpm run deploy --filter backend` - Deploy backend to Cloudflare

## Deployment

Deploy the backend to Cloudflare Workers and the frontend to Cloudflare Pages or another hosting service.