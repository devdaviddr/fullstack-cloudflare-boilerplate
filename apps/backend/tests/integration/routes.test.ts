import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { setupProtectedRoutes } from '../../src/routes/todos'

// Mock auth middleware
vi.mock('../../src/middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    // For tests, set a mock user
    c.set('user', {
      id: 'test-user-id',
      email: 'test@example.com',
      firebaseUid: 'firebase-uid',
    })
    c.set('userId', 'test-user-id')
    return next()
  }),
}))

// Mock D1 database
const mockDB = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
}

const mockEnv = {
  DB: mockDB,
}

describe('API Routes Integration', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    // Set up environment with mock DB
    app.use('*', async (c, next) => {
      c.env = mockEnv
      await next()
    })
    setupProtectedRoutes(app)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/todos', () => {
    it('returns todos for authenticated user', async () => {
      const mockTodos = {
        results: [
          {
            id: '1',
            text: 'Test todo',
            completed: 0,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      mockDB.all.mockResolvedValue(mockTodos)

      const res = await app.request('/api/todos')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual(mockTodos.results)
    })

    it('requires authentication', async () => {
      // Temporarily unmock auth to test unauthenticated request
      const { authMiddleware } = await import('../../src/middleware/auth')
      ;(authMiddleware as any).mockImplementationOnce(async c => {
        c.status(401)
        return c.json({ error: 'Unauthorized' })
      })

      const res = await app.request('/api/todos')
      expect(res.status).toBe(401) // Should be handled by auth middleware
    })
  })

  describe('POST /api/todos', () => {
    it('creates a new todo', async () => {
      const newTodo = { id: 'new-id', text: 'New todo', completed: false }
      mockDB.first.mockResolvedValue(newTodo)

      const res = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'New todo' }),
      })

      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body).toMatchObject({
        text: 'New todo',
        completed: false,
        id: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    })

    it('validates input data', async () => {
      const res = await app.request('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('required')
    })
  })

  describe('PUT /api/todos/:id', () => {
    it('updates an existing todo', async () => {
      const updatedTodo = {
        id: '1',
        text: 'Updated todo',
        completed: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockDB.first
        .mockResolvedValueOnce({ id: '1' }) // Exists check
        .mockResolvedValueOnce(updatedTodo) // Updated result

      const res = await app.request('/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Updated todo' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.text).toBe('Updated todo')
    })

    it('returns 404 for non-existent todo', async () => {
      mockDB.first.mockResolvedValue(null)

      const res = await app.request('/api/todos/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Updated' }),
      })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/todos/:id', () => {
    it('deletes a todo', async () => {
      mockDB.run.mockResolvedValue({ meta: { changes: 1 } })

      const res = await app.request('/api/todos/1', {
        method: 'DELETE',
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    it('returns 404 for non-existent todo', async () => {
      mockDB.run.mockResolvedValue({ meta: { changes: 0 } })

      const res = await app.request('/api/todos/999', {
        method: 'DELETE',
      })

      expect(res.status).toBe(404)
    })
  })
})
