# Fullstack Cloudflare Todo App

A modern, production-ready todo application built with React, TypeScript, and Cloudflare's edge infrastructure. Features Firebase authentication, real-time updates, and a responsive mobile-first design.

## ✨ Features

- **🔐 Firebase Authentication**: Secure user authentication with Google sign-in
- **📱 Mobile-First Design**: Responsive UI built with Tailwind CSS
- **⚡ Real-time Updates**: Instant synchronization using React Query
- **🗄️ Cloudflare D1 Database**: Serverless SQLite database for data persistence
- **🌐 Edge Deployment**: Global CDN deployment on Cloudflare Workers & Pages
- **🔄 Monorepo Architecture**: Efficient development with Turborepo
- **📦 TypeScript**: Full type safety across frontend and backend
- **🎨 Modern UI**: Clean, accessible interface with dark/light mode support
- **🏷️ Semantic Versioning**: Automated version tracking with CI/CD pipeline

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (Cloudflare CLI)

### Installation

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd fullstack-cloudflare-boilerplate
   pnpm install
   ```

2. **Set up local database:**
   ```bash
   cd apps/backend
   ./setup-local-db.sh
   ```

3. **Start development:**
   ```bash
   pnpm run dev
   ```

   Visit [http://localhost:5173](http://localhost:5173) for the frontend and the backend will be available at the configured port.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation
- Firebase Auth for authentication

**Backend:**
- Hono framework on Cloudflare Workers
- Cloudflare D1 (SQLite) database
- TypeScript throughout
- JWT authentication middleware

**Infrastructure:**
- Cloudflare Workers (API)
- Cloudflare Pages (Frontend)
- Cloudflare D1 (Database)
- Turborepo (Monorepo management)

### Project Structure

```
fullstack-cloudflare-boilerplate/
├── apps/
│   ├── frontend/          # React SPA
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Route components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── contexts/    # React contexts
│   │   │   └── lib/         # Utilities & API client
│   │   └── package.json
│   └── backend/           # Hono API server
│       ├── src/
│       │   ├── routes/      # API route handlers
│       │   ├── middleware/  # Custom middleware
│       │   └── types/       # TypeScript definitions
│       ├── migrations/      # Database migrations
│       └── wrangler.toml    # Cloudflare config
├── packages/
│   └── types/             # Shared TypeScript types
└── docs/
    ├── deploy.md          # Deployment guide
    └── schema.md          # Database schema docs
```

## 📋 API Endpoints

### Authentication
- `GET /api/health` - Health check
- `POST /api/auth/verify` - Verify Firebase token

### Todos
- `GET /api/todos` - Get user's todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

All endpoints require Firebase authentication via Bearer token.

**API Version**: The API version is dynamically tracked using semantic versioning (e.g., `1.0.42+abc1234.202512181430`) and is available in all responses.

## 🗄️ Database Schema

The application uses Cloudflare D1 with two main tables:

### Users Table
```sql
- id: TEXT (Primary Key)
- firebase_uid: TEXT (Unique, Firebase UID)
- email: TEXT
- name: TEXT
- created_at: DATETIME
- updated_at: DATETIME
```

### Todos Table
```sql
- id: TEXT (Primary Key)
- user_id: TEXT (Foreign Key → users.id)
- text: TEXT
- completed: BOOLEAN
- created_at: DATETIME
- updated_at: DATETIME
```

See [schema.md](schema.md) for complete database documentation.

## 🚀 Deployment

### Automated CI/CD (Recommended)

This project includes a GitHub Actions pipeline that automatically deploys to Cloudflare on every push to the `main` branch.

**What it does:**
- ✅ Builds both frontend and backend
- ✅ Runs D1 database migrations
- ✅ Sets up Worker and Pages secrets
- ✅ Deploys backend to Cloudflare Workers
- ✅ Deploys frontend to Cloudflare Pages
- ✅ Provides production URLs for both services

**Setup Requirements:**
- GitHub repository secrets configured (see [actions.md](docs/actions.md))
- Cloudflare API token with Workers and Pages permissions
- D1 database pre-created in Cloudflare

**Trigger:** Automatic deployment on push to `main` branch.

See [docs/actions.md](docs/actions.md) for complete pipeline documentation.

### Automated Deployment Script

Use the automated deployment script to deploy everything at once:

```bash
pnpm run deploy
```

This script will:
- ✅ Create and configure D1 database
- ✅ Run database migrations
- ✅ **Automatically load secrets from `.env` files**
- ✅ Deploy backend to Cloudflare Workers
- ✅ Build and deploy frontend to Cloudflare Pages
- ✅ Configure API URLs and environment variables automatically

**Prerequisites:**
- Wrangler CLI installed and authenticated (`wrangler auth login`)
- `.env` files configured with your secrets (see below)

**Required `.env` files:**
- `apps/backend/.env` - Backend secrets (FIREBASE_PROJECT_ID, etc.)
- `apps/frontend/.env` - Frontend config (VITE_FIREBASE_*, VITE_API_URL, etc.)

### Manual Deployment

Follow the comprehensive deployment guide in [docs/deploy.md](docs/deploy.md) for step-by-step instructions.

### Quick Deploy

1. **Backend:**
   ```bash
   cd apps/backend
   wrangler deploy
   ```

2. **Frontend:**
   ```bash
   cd apps/frontend
   npm run build
   wrangler pages deploy dist
   ```

### Environment Setup

**Required Environment Variables:**

- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev              # Start all services
pnpm run dev --filter frontend    # Frontend only
pnpm run dev --filter backend     # Backend only

# Building
pnpm run build            # Build all apps
pnpm run build --filter frontend
pnpm run build --filter backend

# Quality checks
pnpm run lint             # Lint all code
pnpm run typecheck        # TypeScript checks
pnpm run format           # Format code with Prettier

# Database
cd apps/backend && ./setup-local-db.sh  # Setup local D1 database
```

### Key Features Implemented

- ✅ **User Authentication**: Firebase Auth with Google sign-in
- ✅ **Todo CRUD**: Create, read, update, delete todos
- ✅ **Real-time UI**: React Query for optimistic updates
- ✅ **Mobile Responsive**: Touch-friendly interface
- ✅ **Error Handling**: Comprehensive error boundaries and retry logic
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Database Relations**: Foreign key constraints and cascading deletes
- ✅ **API Security**: JWT token validation and user isolation

### Adding New Features

1. **Database Changes**: Create new migration files in `apps/backend/migrations/`
2. **API Routes**: Add routes in `apps/backend/src/routes/`
3. **Frontend Components**: Add to `apps/frontend/src/components/`
4. **Types**: Update shared types in `packages/types/src/`

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Google Authentication
3. Create a service account and download the key
4. Add credentials to your Cloudflare Worker secrets

### Cloudflare Setup

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Install Wrangler CLI
3. Create D1 database: `wrangler d1 create todo-db`
4. Update `wrangler.toml` with your database ID

## 📚 Documentation

- **[actions.md](docs/actions.md)** - GitHub Actions CI/CD pipeline documentation
- **[deploy.md](docs/deploy.md)** - Complete deployment guide
- **[infra.md](docs/infra.md)** - Cloud infrastructure architecture
- **[schema.md](docs/schema.md)** - Database schema and API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm run lint && pnpm run typecheck`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Live Demo](https://your-deployed-app.pages.dev)
- [API Documentation](schema.md)
- [Deployment Guide](deploy.md)
- [Infrastructure Guide](infra.md)
- [Cloudflare Workers](https://workers.cloudflare.com)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Hono Framework](https://hono.dev)
- [Turborepo](https://turbo.build/repo)
