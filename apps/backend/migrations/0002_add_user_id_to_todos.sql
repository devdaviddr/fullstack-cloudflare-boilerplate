-- Add user_id column to todos table for user-specific data
ALTER TABLE todos ADD COLUMN user_id TEXT NOT NULL DEFAULT '';

-- Create index on user_id for efficient filtering
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Note: Existing todos will have empty user_id
-- In production, you might want to:
-- 1. Backfill existing todos to a default user
-- 2. Or require users to re-create their todos after authentication
-- 3. Or implement a migration script to assign existing todos to users