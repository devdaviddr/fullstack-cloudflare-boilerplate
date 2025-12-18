#!/bin/bash

echo "Setting up local D1 database..."

# Check if users table exists
TABLE_EXISTS=$(wrangler d1 execute todo-db --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name='users';" | grep -c "users")

if [ "$TABLE_EXISTS" -eq 0 ]; then
  echo "Users table not found. Running migrations..."

  # Run migrations for users table
  wrangler d1 execute todo-db --local --file=./migrations/0001_create_users_table.sql

  # Run migrations for todos table
  wrangler d1 execute todo-db --local --file=./migrations/0002_create_todos_table.sql

  echo "Local D1 setup complete."
else
  echo "Local D1 database already set up. Skipping migrations."
fi