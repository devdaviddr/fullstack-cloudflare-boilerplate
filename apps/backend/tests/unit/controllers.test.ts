import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { TodoController } from '../../src/controllers/todo'

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

const mockContext = (method: string, path: string, body?: any) => {
  const ctx = {
    env: mockEnv,
    req: {
      method,
      param: vi.fn((key: string) => path.split('/').pop()),
      json: vi.fn().mockResolvedValue(body || {}),
    },
    get: vi.fn((key: string) => {
      if (key === 'userId') return 'test-user-id'
      if (key === 'user')
        return {
          id: 'test-user-id',
          email: 'test@example.com',
          firebaseUid: 'firebase-uid',
        }
      return undefined
    }),
    json: vi.fn(),
  } as any
  return ctx
}

describe('TodoController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset DB mocks to default resolved values
    mockDB.first.mockResolvedValue(null)
    mockDB.all.mockResolvedValue({ results: [] })
    mockDB.run.mockResolvedValue({ meta: { changes: 0 } })
  })

  describe('getTodos', () => {
    it('returns todos for authenticated user', async () => {
      const mockTodos = {
        results: [
          {
            id: '1',
            text: 'Test todo',
            completed: 0,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
      }
      mockDB.all.mockResolvedValue(mockTodos)

      const ctx = mockContext('GET', '/todos')

      await TodoController.getTodos(ctx)

      expect(mockDB.prepare).toHaveBeenCalledWith(
        'SELECT id, text, completed, created_at, updated_at FROM todos WHERE user_id = ? ORDER BY created_at DESC'
      )
      expect(mockDB.bind).toHaveBeenCalledWith('test-user-id')
      expect(ctx.json).toHaveBeenCalledWith(mockTodos.results)
    })

    it('handles database errors', async () => {
      mockDB.all.mockRejectedValue(new Error('Database error'))

      const ctx = mockContext('GET', '/todos')

      await TodoController.getTodos(ctx)

      expect(ctx.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch todos' },
        500
      )
    })
  })

  describe('createTodo', () => {
    it('creates a new todo successfully', async () => {
      const newTodo = { text: 'New todo' }
      const mockResult = {
        id: 'new-id',
        user_id: 'test-user-id',
        text: 'New todo',
        completed: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockDB.first.mockResolvedValue(mockResult)

      const ctx = mockContext('POST', '/todos', newTodo)

      await TodoController.createTodo(ctx)

      expect(mockDB.prepare).toHaveBeenCalledWith(
        'INSERT INTO todos (id, text, completed, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      expect(ctx.json).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'New todo',
          completed: false,
          id: expect.any(String), // UUID generated
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
        201
      )
    })

    it('validates input data', async () => {
      const invalidTodo = { text: '' }

      const ctx = mockContext('POST', '/todos', invalidTodo)

      await TodoController.createTodo(ctx)

      // Should fail validation before reaching database
      expect(ctx.json).toHaveBeenCalledWith(
        { error: 'Text is required and must be a non-empty string' },
        400
      )
    })

    it('handles database errors', async () => {
      const newTodo = { text: 'New todo' }
      mockDB.run.mockRejectedValue(new Error('Database error'))

      const ctx = mockContext('POST', '/todos', newTodo)

      await TodoController.createTodo(ctx)

      expect(ctx.json).toHaveBeenCalledWith(
        { error: 'Failed to create todo' },
        500
      )
    })
  })

  describe('updateTodo', () => {
    it('updates a todo successfully', async () => {
      const updateData = { text: 'Updated todo' }

      mockDB.first.mockClear()
      mockDB.first
        .mockResolvedValueOnce({ id: '1' }) // Check existence
        .mockResolvedValueOnce({
          // Get updated result
          id: '1',
          text: 'Updated todo',
          completed: 0,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        })

      const ctx = mockContext('PUT', '/todos/1', updateData)

      await TodoController.updateTodo(ctx)

      expect(ctx.json).toHaveBeenCalledWith({
        id: '1',
        text: 'Updated todo',
        completed: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })
    })

    it('returns 404 for non-existent todo', async () => {
      const updateData = { text: 'Updated todo' }

      mockDB.first.mockClear()
      mockDB.first.mockResolvedValueOnce(null) // Todo not found

      const ctx = mockContext('PUT', '/todos/1', updateData)

      await TodoController.updateTodo(ctx)

      expect(ctx.json).toHaveBeenCalledWith({ error: 'Todo not found' }, 404)
    })

    it('requires at least one field to update', async () => {
      const ctx = mockContext('PUT', '/todos/1', {})

      await TodoController.updateTodo(ctx)

      expect(ctx.json).toHaveBeenCalledWith(
        { error: 'Must provide text or completed field' },
        400
      )
    })
  })

  describe('deleteTodo', () => {
    it('deletes a todo successfully', async () => {
      mockDB.run.mockResolvedValue({ meta: { changes: 1 } })

      const ctx = mockContext('DELETE', '/todos/1')

      await TodoController.deleteTodo(ctx)

      expect(mockDB.prepare).toHaveBeenCalledWith(
        'DELETE FROM todos WHERE id = ? AND user_id = ?'
      )
      expect(ctx.json).toHaveBeenCalledWith({ success: true })
    })

    it('returns 404 for non-existent todo', async () => {
      mockDB.run.mockResolvedValue({ meta: { changes: 0 } })

      const ctx = mockContext('DELETE', '/todos/1')

      await TodoController.deleteTodo(ctx)

      expect(ctx.json).toHaveBeenCalledWith({ error: 'Todo not found' }, 404)
    })
  })
})
