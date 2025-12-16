# Contributing to Fullstack Cloudflare Boilerplate

## Development Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development servers:
   ```bash
   pnpm dev
   ```

## Project Structure

```
├── apps/
│   ├── backend/     # Cloudflare Workers backend
│   └── frontend/    # React frontend
├── packages/
│   ├── types/       # Shared TypeScript types
│   ├── utils/       # Shared utilities
│   ├── tsconfig/    # Shared TypeScript configs
│   └── eslint-config/ # Shared ESLint configs
```

## Available Scripts

- `pnpm dev` - Start all dev servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type check all packages
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean all build artifacts

## Adding a New Package

1. Create a new directory in `packages/`
2. Add `package.json` with `@fullstack/` scope
3. Add to `pnpm-workspace.yaml` if not already covered
4. Extend shared configs where applicable

## Coding Standards

- Use TypeScript for all code
- Follow ESLint and Prettier configurations
- Write type-safe code
- Add JSDoc comments for public APIs
