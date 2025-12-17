# Database Schema

This document outlines the database schema and data structure for the fullstack Cloudflare boilerplate application.

## Database Technology

This application uses **Cloudflare D1** as its primary database, which is a serverless SQL database built on SQLite. D1 provides:

- Global low-latency access
- Automatic scaling
- SQLite-compatible SQL syntax
- RESTful API access
- Built-in migration support

## Database Configuration

The database is configured in `apps/backend/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "todo-db"
database_id = "local-todo-db"  # Replace with your actual database ID
migrations_dir = "migrations"
```

## Tables

### 1. Users Table

Stores Firebase user information and profile data.

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` (TEXT, PRIMARY KEY): Internal user ID (UUID or similar)
- `firebase_uid` (TEXT, UNIQUE): Firebase Authentication user ID
- `email` (TEXT): User's email address
- `name` (TEXT): User's display name
- `created_at` (DATETIME): Account creation timestamp
- `updated_at` (DATETIME): Last profile update timestamp

**Indexes:**
- `idx_users_firebase_uid` on `firebase_uid` for efficient Firebase user lookups

### 2. Todos Table

Stores todo items with foreign key relationship to users.

```sql
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**
- `id` (TEXT, PRIMARY KEY): Todo item ID (UUID)
- `user_id` (TEXT, FOREIGN KEY): References `users.id` (CASCADE delete)
- `text` (TEXT): Todo item description/content
- `completed` (BOOLEAN): Completion status (default: FALSE)
- `created_at` (DATETIME): Todo creation timestamp
- `updated_at` (DATETIME): Last todo update timestamp

**Indexes:**
- `idx_todos_user_id` on `user_id` for efficient user-specific queries
- `idx_todos_completed` on `completed` for filtering completed/incomplete todos
- `idx_todos_created_at` on `created_at` for chronological sorting

## Relationships

```
users (1) ──── (many) todos
   │                   │
   └─ id ──────────────┼─ user_id (FK)
                       │
                       └─ ON DELETE CASCADE
```

- **One-to-Many**: One user can have multiple todos
- **Cascading Deletes**: When a user is deleted, all their todos are automatically deleted
- **Referential Integrity**: Foreign key constraints ensure data consistency

## TypeScript Interfaces

### Backend Types (`apps/backend/src/types/index.ts`)

```typescript
export interface User {
  id: string
  firebase_uid: string
  email: string
  name: string
}

export interface Env extends Record<string, unknown> {
  DB: D1Database
  FIREBASE_PROJECT_ID: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_PRIVATE_KEY: string
}
```

### Frontend Types (`apps/frontend/src/lib/api.ts`)

```typescript
export interface Todo {
  id: string
  text: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface CreateTodoRequest {
  text: string
}

export interface UpdateTodoRequest {
  text?: string
  completed?: boolean
}
```

## Migration History

### Migration 0001: Create Users Table
- **File**: `apps/backend/migrations/0001_create_users_table.sql`
- **Purpose**: Initial user management setup
- **Date**: Base migration

### Migration 0002: Create Todos Table
- **File**: `apps/backend/migrations/0002_create_todos_table.sql`
- **Purpose**: Todo functionality implementation
- **Date**: Follows user table creation

## Additional Storage

### KV Namespaces

Configured for key-value storage (optional):

```toml
[[kv_namespaces]]
binding = "MY_KV_NAMESPACE"
id = "your-namespace-id"
preview_id = "your-preview-namespace-id"
```

**Use Cases:**
- Session storage
- Cache data
- Configuration storage
- Rate limiting data

### R2 Buckets

Configured for object storage (optional):

```toml
[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"
```

**Use Cases:**
- File uploads
- Static assets
- User-generated content
- Backup storage

## Database Operations

### Common Queries

**Get user by Firebase UID:**
```sql
SELECT * FROM users WHERE firebase_uid = ?
```

**Get user's todos:**
```sql
SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC
```

**Get completed todos:**
```sql
SELECT * FROM todos WHERE user_id = ? AND completed = 1
```

**Create new todo:**
```sql
INSERT INTO todos (id, user_id, text, completed) VALUES (?, ?, ?, ?)
```

**Update todo:**
```sql
UPDATE todos SET text = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?
```

**Delete todo:**
```sql
DELETE FROM todos WHERE id = ? AND user_id = ?
```

## Performance Considerations

### Indexes
- Primary keys on all tables for fast lookups
- Foreign key index on `todos.user_id` for JOIN operations
- Status index on `todos.completed` for filtering
- Timestamp index on `todos.created_at` for sorting

### Query Optimization
- Use parameterized queries to prevent SQL injection
- Leverage indexes for WHERE clauses and JOINs
- Consider pagination for large result sets
- Use transactions for multi-table operations

## Data Validation

### Application-Level Validation
- User authentication required for all operations
- User can only access/modify their own todos
- Input sanitization on all text fields
- UUID validation for IDs

### Database-Level Constraints
- NOT NULL constraints on required fields
- UNIQUE constraints on Firebase UIDs
- FOREIGN KEY constraints with CASCADE deletes
- BOOLEAN type enforcement for completion status

## Backup and Recovery

### D1 Backup
- Automatic backups through Cloudflare
- Point-in-time recovery available
- Cross-region replication

### Migration Safety
- All migrations use `IF NOT EXISTS` for safety
- Rollback scripts available if needed
- Test migrations on development database first

## Development Setup

### Local Database
```bash
# Run setup script
cd apps/backend
./setup-local-db.sh
```

### Database Browser
Use Cloudflare's D1 console or third-party SQLite tools to inspect local database:
```bash
wrangler d1 execute todo-db --local --command "SELECT * FROM users LIMIT 5;"
```

## Future Schema Extensions

### Potential Additions
- **Categories/Tags**: Add categorization to todos
- **Priorities**: Add priority levels (low, medium, high)
- **Due Dates**: Add deadline tracking
- **Attachments**: Link to files in R2 storage
- **Comments**: Add todo-specific comments
- **Sharing**: Allow todo sharing between users

### Migration Strategy
- Always create new migration files for schema changes
- Test migrations thoroughly before deployment
- Document breaking changes in release notes
- Consider data migration scripts for complex changes