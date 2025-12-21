# Fullstack Cloudflare Todo App

A modern, production-ready todo application built with React, TypeScript, and Cloudflare's edge infrastructure. Features Firebase authentication, real-time updates, and a responsive mobile-first design.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (Cloudflare CLI)
- Firebase project (see Configuration below)

### Installation

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd fullstack-cloudflare-boilerplate
   pnpm install
   ```

2. **Configure environment:**
   - Copy `apps/backend/.env.example` to `apps/backend/.env` and update with your Firebase project ID
   - Copy `apps/frontend/.env.example` to `apps/frontend/.env` and update with your Firebase config

3. **Start development:**
   ```bash
   pnpm run dev
   ```

   This will:
   - Automatically set up the local D1 database (first run only)
   - Start the backend API on [http://localhost:8788](http://localhost:8788)
   - Start the frontend on [http://localhost:5173](http://localhost:5173)

4. **Open your browser:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Sign in with Google to test authentication
   - Create and manage todos

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

**API Version**: The API version is dynamically tracked using semantic versioning (e.g., `1.0.42+abc1234.202512181430`) and is available in all responses. Version numbers are automatically generated from the `VERSION` file and CI/CD metadata.

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

See [docs/schema.md](docs/schema.md) for complete database documentation.

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
   pnpm run build
   wrangler pages deploy dist
   ```

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

### Version Management

This project uses semantic versioning with automated CI/CD deployment. Version numbers are generated in the format `{MAJOR}.{MINOR}.{PATCH}+{BUILD}.{SHA}.{TIMESTAMP}`.

**To bump versions:**
```bash
# Minor version bump (new features)
echo "1.1.0" > VERSION

# Major version bump (breaking changes)  
echo "2.0.0" > VERSION

# Commit and push to trigger new version
git add VERSION
git commit -m "chore: bump version to 1.1.0"
git push origin main
```

The CI/CD pipeline automatically appends build metadata to create versions like `1.1.0+42.abc1234.202512181430`.

See **[versioning.md](docs/versioning.md)** for complete documentation on the versioning system.

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

## 🧪 Testing

The project includes comprehensive unit and integration tests for the backend.

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests for backend only
pnpm run test --filter backend

# Run tests in watch mode
cd apps/backend && pnpm run test:watch

# Run tests with coverage
cd apps/backend && pnpm run test:coverage
```

### Test Structure

- **Unit Tests**: `apps/backend/tests/unit/`
  - Controllers, middleware, rate limiting, schemas
- **Integration Tests**: `apps/backend/tests/integration/`
  - End-to-end API route testing

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Google Authentication in Authentication > Sign-in method
3. Go to Project Settings > General > Your apps, and create a Web app
4. Copy the Firebase config values to `apps/frontend/.env`
5. Copy your Project ID to `apps/backend/.env`

### GitHub Repository Secrets (CI/CD)

To enable automated deployments via GitHub Actions, configure the following secrets in your repository:

**To add secrets:**
1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret below with its corresponding value

**Required Secrets:**

**Cloudflare Authentication** (2 secrets)
- `CLOUDFLARE_API_TOKEN` - Create at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
  - Required permissions: Workers:Edit, Pages:Edit, D1:Edit, Account:Read
- `CLOUDFLARE_ACCOUNT_ID` - Find in Cloudflare Dashboard URL or Workers & Pages overview

**Worker Configuration** (1 secret)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID (same as backend .env)

**Frontend Build Variables** (7-8 secrets)
- `VITE_API_URL` - Your production Worker URL (e.g., `https://your-worker.workers.dev`)
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain (e.g., `your-project.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (optional, for Google Analytics)

**Total: 10-11 secrets required**

Once configured, every push to `main` branch will automatically deploy to production. See [docs/actions.md](docs/actions.md) for complete CI/CD pipeline documentation.

### Environment Variables

**Backend (.env):**
```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
```

**Frontend (.env):**
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_API_URL=http://localhost:8788
```

### Cloudflare Setup

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Install Wrangler CLI: `npm install -g wrangler`
3. Login: `wrangler auth login`
4. Create D1 database: `wrangler d1 create todo-db`
5. Update `apps/backend/wrangler.toml` with your database ID

## 📚 Documentation

- **[versioning.md](docs/versioning.md)** - Complete versioning system guide
- **[actions.md](docs/actions.md)** - GitHub Actions CI/CD pipeline documentation
- **[deploy.md](docs/deploy.md)** - Complete deployment guide
- **[infra.md](docs/infra.md)** - Cloud infrastructure architecture
- **[schema.md](docs/schema.md)** - Database schema and API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks:
   ```bash
   pnpm run lint        # Lint code
   pnpm run typecheck   # TypeScript checks
   pnpm run test        # Run tests
   pnpm run format      # Format code
   ```
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request