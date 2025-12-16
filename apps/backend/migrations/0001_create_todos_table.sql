-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on completed status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);