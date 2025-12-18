import type { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { authMiddleware } from '../middleware/auth'
import { TodoController } from '../controllers/todo'

export function setupProtectedRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  /**
   * GET /api/todos - Fetch all todos for authenticated user
   */
  app.get('/api/todos', authMiddleware, TodoController.getTodos)

  /**
   * POST /api/todos - Create a new todo
   */
  app.post('/api/todos', authMiddleware, TodoController.createTodo)

  /**
   * PUT /api/todos/:id - Update a todo
   */
  app.put('/api/todos/:id', authMiddleware, TodoController.updateTodo)

  /**
   * DELETE /api/todos/:id - Delete a todo
   */
  app.delete('/api/todos/:id', authMiddleware, TodoController.deleteTodo)
}