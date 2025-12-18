#!/bin/bash

echo "Setting up local D1 database..."

# Run migrations for users table
wrangler d1 execute fullstack-backend --local --file=./migrations/0001_create_users_table.sql

# Run migrations for todos table
wrangler d1 execute fullstack-backend --local --file=./migrations/0002_create_todos_table.sql

echo "Local D1 setup complete."