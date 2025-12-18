#!/bin/bash

# Fullstack Cloudflare Deployment Script
# This script deploys the frontend to Cloudflare Pages, backend to Workers, sets up D1 database, and configures secrets

set -e  # Exit on any error

echo "🚀 Starting fullstack Cloudflare deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI is not installed. Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    print_error "You are not logged in to Cloudflare. Please run: wrangler login"
    exit 1
fi

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install it."
    exit 1
fi

# Install dependencies if needed
print_status "Installing dependencies..."
pnpm install

# Build all packages
print_status "Building packages..."
pnpm run build

# Prompt for database name
read -p "Enter D1 database name (default: todo-db-new): " DB_NAME
DB_NAME=${DB_NAME:-todo-db-new}

# Step 1: Create D1 Database
print_status "Creating D1 database: $DB_NAME"
# Check if database already exists
DB_LIST_OUTPUT=$(wrangler d1 list 2>/dev/null)
if echo "$DB_LIST_OUTPUT" | grep -q "$DB_NAME"; then
    print_warning "Database $DB_NAME already exists."
    # Get the existing database ID (first UUID in the line)
    DB_ID=$(echo "$DB_LIST_OUTPUT" | grep "$DB_NAME" | head -1 | grep -o '[a-f0-9]\{8\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{12\}' | head -1)
else
    # Try to create the database
    if DB_CREATE_OUTPUT=$(wrangler d1 create "$DB_NAME" 2>&1); then
        print_success "Database created"
        # Extract database ID from creation output
        DB_ID=$(echo "$DB_CREATE_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    else
        print_error "Failed to create database: $DB_CREATE_OUTPUT"
        exit 1
    fi
fi

if [ -z "$DB_ID" ]; then
    print_error "Could not find database ID for $DB_NAME"
    exit 1
fi
print_success "Database ID: $DB_ID"

# Update wrangler.toml with database ID
print_status "Updating wrangler.toml with database ID..."
sed -i.bak "s/database_id = \"local-todo-db\"/database_id = \"$DB_ID\"/" apps/backend/wrangler.toml
rm apps/backend/wrangler.toml.bak

# Step 2: Run database migrations
print_status "Running database migrations..."
cd apps/backend

# Run migrations
wrangler d1 execute "$DB_NAME" --remote --file=./migrations/0001_create_users_table.sql
wrangler d1 execute "$DB_NAME" --remote --file=./migrations/0002_create_todos_table.sql

print_success "Database migrations completed"
cd ../..

# Step 3: Set up secrets
print_status "Setting up secrets..."

# Change to backend directory for wrangler commands
cd apps/backend

# Load secrets from backend .env file
if [ -f ".env" ]; then
    # Extract FIREBASE_PROJECT_ID from .env (ignoring comments)
    FIREBASE_PROJECT_ID=$(grep '^FIREBASE_PROJECT_ID=' .env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    if [ -n "$FIREBASE_PROJECT_ID" ]; then
        echo "$FIREBASE_PROJECT_ID" | wrangler secret put FIREBASE_PROJECT_ID
        print_success "Firebase Project ID secret set from backend .env"
    else
        print_warning "FIREBASE_PROJECT_ID not found in backend .env"
    fi
else
    print_warning "backend .env file not found"
fi

# Add more secrets as needed - you can customize this section
# Example: wrangler secret put YOUR_SECRET_NAME

# Step 4: Deploy backend
print_status "Deploying backend to Cloudflare Workers..."
BACKEND_DEPLOY_OUTPUT=$(wrangler deploy)
BACKEND_URL=$(echo "$BACKEND_DEPLOY_OUTPUT" | grep -o 'https://[^[:space:]]*workers\.dev')
if [ -z "$BACKEND_URL" ]; then
    print_error "Could not extract backend URL from deployment output"
    exit 1
fi
print_success "Backend deployed to: $BACKEND_URL"
cd ../..

# Step 5: Build frontend
print_status "Building frontend..."
cd apps/frontend
pnpm run build
cd ../..

# Step 6: Deploy frontend to Pages
print_status "Deploying frontend to Cloudflare Pages..."

# Load frontend environment variables from .env
if [ -f "apps/frontend/.env" ]; then
    # Extract VITE_ variables from frontend .env
    VITE_API_URL_DEPLOY=$BACKEND_URL  # Override with deployed URL
    
    VITE_FIREBASE_API_KEY=$(grep '^VITE_FIREBASE_API_KEY=' apps/frontend/.env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    VITE_FIREBASE_AUTH_DOMAIN=$(grep '^VITE_FIREBASE_AUTH_DOMAIN=' apps/frontend/.env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    VITE_FIREBASE_PROJECT_ID_FRONTEND=$(grep '^VITE_FIREBASE_PROJECT_ID=' apps/frontend/.env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    VITE_FIREBASE_STORAGE_BUCKET=$(grep '^VITE_FIREBASE_STORAGE_BUCKET=' apps/frontend/.env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    VITE_FIREBASE_MESSAGING_SENDER_ID=$(grep '^VITE_FIREBASE_MESSAGING_SENDER_ID=' apps/frontend/.env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    VITE_FIREBASE_APP_ID=$(grep '^VITE_FIREBASE_APP_ID=' apps/frontend/.env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    VITE_FIREBASE_MEASUREMENT_ID=$(grep '^VITE_FIREBASE_MEASUREMENT_ID=' apps/frontend/.env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    
    # Set VITE_API_URL to the deployed backend URL
    wrangler pages secret put VITE_API_URL --project-name fullstack-frontend --value="$VITE_API_URL_DEPLOY"
    
    # Set Firebase configuration variables
    [ -n "$VITE_FIREBASE_API_KEY" ] && wrangler pages secret put VITE_FIREBASE_API_KEY --project-name fullstack-frontend --value="$VITE_FIREBASE_API_KEY"
    [ -n "$VITE_FIREBASE_AUTH_DOMAIN" ] && wrangler pages secret put VITE_FIREBASE_AUTH_DOMAIN --project-name fullstack-frontend --value="$VITE_FIREBASE_AUTH_DOMAIN"
    [ -n "$VITE_FIREBASE_PROJECT_ID_FRONTEND" ] && wrangler pages secret put VITE_FIREBASE_PROJECT_ID --project-name fullstack-frontend --value="$VITE_FIREBASE_PROJECT_ID_FRONTEND"
    [ -n "$VITE_FIREBASE_STORAGE_BUCKET" ] && wrangler pages secret put VITE_FIREBASE_STORAGE_BUCKET --project-name fullstack-frontend --value="$VITE_FIREBASE_STORAGE_BUCKET"
    [ -n "$VITE_FIREBASE_MESSAGING_SENDER_ID" ] && wrangler pages secret put VITE_FIREBASE_MESSAGING_SENDER_ID --project-name fullstack-frontend --value="$VITE_FIREBASE_MESSAGING_SENDER_ID"
    [ -n "$VITE_FIREBASE_APP_ID" ] && wrangler pages secret put VITE_FIREBASE_APP_ID --project-name fullstack-frontend --value="$VITE_FIREBASE_APP_ID"
    [ -n "$VITE_FIREBASE_MEASUREMENT_ID" ] && wrangler pages secret put VITE_FIREBASE_MEASUREMENT_ID --project-name fullstack-frontend --value="$VITE_FIREBASE_MEASUREMENT_ID"
    
    print_success "Frontend environment variables set from .env"
else
    # Fallback: just set the API URL
    wrangler pages secret put VITE_API_URL --project-name fullstack-frontend --value="$BACKEND_URL"
    print_warning "frontend .env file not found, only API URL set"
fi

# Deploy to Pages
FRONTEND_DEPLOY_OUTPUT=$(wrangler pages deploy apps/frontend/dist --project-name fullstack-frontend)
FRONTEND_URL=$(echo "$FRONTEND_DEPLOY_OUTPUT" | grep -o 'https://[^[:space:]]*\.pages\.dev' | head -1)
if [ -z "$FRONTEND_URL" ]; then
    print_error "Could not extract frontend URL from deployment output"
    exit 1
fi

print_success "Frontend deployed to: $FRONTEND_URL"

# Final summary
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  Database: $DB_NAME"
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: $FRONTEND_URL"
echo ""
echo "🔧 Next steps:"
echo "  1. Update your frontend API configuration if needed"
echo "  2. Set up custom domains in Cloudflare Dashboard if desired"
echo "  3. Test your application at $FRONTEND_URL"
echo ""
echo "📝 Useful commands:"
echo "  View backend logs: wrangler tail"
echo "  View pages logs: wrangler pages deployment tail"
echo "  List databases: wrangler d1 list"