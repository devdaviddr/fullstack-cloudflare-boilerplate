import type { Context } from 'hono'
import type { Env, Variables } from '../types'

export class TodoController {
  /**
   * GET /api/todos - Fetch all todos for authenticated user
   */
  static async getTodos(c: Context<{ Bindings: Env; Variables: Variables }>) {
    const user = c.get('user')

    try {
      const { results } = await c.env.DB.prepare(
        'SELECT id, text, completed, created_at, updated_at FROM todos WHERE user_id = ? ORDER BY created_at DESC'
      )
        .bind(user.id)
        .all()

      return c.json(results || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
      return c.json({ error: 'Failed to fetch todos' }, 500)
    }
  }

  /**
   * POST /api/todos - Create a new todo
   */
  static async createTodo(c: Context<{ Bindings: Env; Variables: Variables }>) {
    const user = c.get('user')

    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }

    const { text } = body as { text: string }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return c.json(
        { error: 'Text is required and must be a non-empty string' },
        400
      )
    }

    if (text.trim().length > 500) {
      return c.json({ error: 'Text must be 500 characters or less' }, 400)
    }

    try {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      await c.env.DB.prepare(
        'INSERT INTO todos (id, text, completed, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(id, text.trim(), 0, user.id, now, now)
        .run()

      return c.json(
        {
          id,
          text: text.trim(),
          completed: false,
          created_at: now,
          updated_at: now,
        },
        201
      )
    } catch (error) {
      console.error('Error creating todo:', error)
      return c.json({ error: 'Failed to create todo' }, 500)
    }
  }

  /**
   * PUT /api/todos/:id - Update a todo
   */
  static async updateTodo(c: Context<{ Bindings: Env; Variables: Variables }>) {
    const user = c.get('user')
    const id = c.req.param('id')

    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }

    const { text, completed } = body as { text?: string; completed?: boolean }

    // Validate input
    if (text !== undefined) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return c.json({ error: 'Text must be a non-empty string' }, 400)
      }
      if (text.trim().length > 500) {
        return c.json({ error: 'Text must be 500 characters or less' }, 400)
      }
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return c.json({ error: 'Completed must be a boolean' }, 400)
    }

    if (text === undefined && completed === undefined) {
      return c.json({ error: 'Must provide text or completed field' }, 400)
    }

    try {
      // Verify ownership
      const existing = await c.env.DB.prepare(
        'SELECT id FROM todos WHERE id = ? AND user_id = ?'
      )
        .bind(id, user.id)
        .first()

      if (!existing) {
        return c.json({ error: 'Todo not found' }, 404)
      }

      // Build update query
      const updates: string[] = []
      const values: unknown[] = []

      if (text !== undefined) {
        updates.push('text = ?')
        values.push(text.trim())
      }

      if (completed !== undefined) {
        updates.push('completed = ?')
        values.push(completed ? 1 : 0)
      }

      updates.push('updated_at = ?')
      const now = new Date().toISOString()
      values.push(now)

      await c.env.DB.prepare(
        `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
      )
        .bind(...values, id, user.id)
        .run()

      // Fetch and return updated todo
      const updated = await c.env.DB.prepare(
        'SELECT id, text, completed, created_at, updated_at FROM todos WHERE id = ? AND user_id = ?'
      )
        .bind(id, user.id)
        .first()

      return c.json(updated)
    } catch (error) {
      console.error('Error updating todo:', error)
      return c.json({ error: 'Failed to update todo' }, 500)
    }
  }

  /**
   * DELETE /api/todos/:id - Delete a todo
   */
  static async deleteTodo(c: Context<{ Bindings: Env; Variables: Variables }>) {
    const user = c.get('user')
    const id = c.req.param('id')

    try {
      const result = await c.env.DB.prepare(
        'DELETE FROM todos WHERE id = ? AND user_id = ?'
      )
        .bind(id, user.id)
        .run()

      if (result.meta.changes === 0) {
        return c.json({ error: 'Todo not found' }, 404)
      }

      return c.json({ success: true })
    } catch (error) {
      console.error('Error deleting todo:', error)
      return c.json({ error: 'Failed to delete todo' }, 500)
    }
  }
}
