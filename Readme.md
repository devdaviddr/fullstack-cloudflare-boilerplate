# Fullstack Cloudflare Todo App

A production-ready todo application built with React, TypeScript, and Cloudflare's edge infrastructure. Features Firebase authentication, real-time updates, and serverless deployment.

**Tech Stack:** React + Vite, Hono on Cloudflare Workers, D1 Database, Firebase Auth, Turborepo

## 🚀 Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+
- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

### Setup

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd fullstack-cloudflare-boilerplate
   pnpm install
   ```

2. **Configure environment:**
   
   Copy `.env.example` files and add your Firebase credentials:
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Add your FIREBASE_PROJECT_ID
   
   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env
   # Add your VITE_FIREBASE_* config values
   ```

3. **Start development:**
   ```bash
   pnpm run dev
   ```
   
   - Backend: [http://localhost:8788](http://localhost:8788)
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Local D1 database is automatically set up on first run

## 📁 Project Structure

```
fullstack-cloudflare-boilerplate/
├── apps/
│   ├── frontend/          # React SPA (Cloudflare Pages)
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # Route pages
│   │   │   ├── hooks/       # React hooks
│   │   │   └── lib/         # API client & utilities
│   │   └── package.json
│   └── backend/           # Hono API (Cloudflare Workers)
│       ├── src/
│       │   ├── routes/      # API endpoints
│       │   ├── middleware/  # Auth & security
│       │   └── controllers/ # Business logic
│       ├── migrations/      # D1 database migrations
│       └── wrangler.toml    # Cloudflare config
├── packages/
│   ├── types/             # Shared TypeScript types
│   └── utils/             # Shared utilities
└── docs/                  # Additional documentation
```

## 🚀 Deployment via GitHub Actions

### Prerequisites
1. **Cloudflare Setup:**
   - Create account at [cloudflare.com](https://cloudflare.com)
   - Create D1 database: `wrangler d1 create todo-db`
   - Update `apps/backend/wrangler.toml` with database ID
   - Create API token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
     - Required permissions: Workers:Edit, Pages:Edit, D1:Edit, Account:Read

2. **Firebase Setup:**
   - Create project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Google Authentication
   - Create Web App and get configuration values

### GitHub Secrets Configuration

Go to **Settings** > **Secrets and variables** > **Actions** and add:

**Cloudflare (2 secrets):**
- `CLOUDFLARE_API_TOKEN` - Your API token
- `CLOUDFLARE_ACCOUNT_ID` - Your account ID

**Backend (1 secret):**
- `FIREBASE_PROJECT_ID` - Your Firebase project ID

**Frontend (7-8 secrets):**
- `VITE_API_URL` - Production Worker URL (e.g., `https://your-worker.workers.dev`)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional, for Google Analytics)

### Deploy

Push to `main` branch to trigger automatic deployment:

```bash
git push origin main
```

The GitHub Actions workflow will:
- Build frontend and backend
- Run database migrations
- Deploy to Cloudflare Workers and Pages
- Configure all secrets automatically

See [docs/actions.md](docs/actions.md) for detailed pipeline documentation.

---

**Additional Documentation:**
- [deploy.md](docs/deploy.md) - Manual deployment guide
- [schema.md](docs/schema.md) - Database schema
- [actions.md](docs/actions.md) - CI/CD pipeline details
- [versioning.md](docs/versioning.md) - Version management