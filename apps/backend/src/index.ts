import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono<{ Bindings: { DB: D1Database } }>()

// Track server start time for uptime calculation
const serverStartTime = Date.now()
let requestCount = 0

// Simple in-memory log storage
const logs: string[] = []

app.use(
  '/api/*',
  cors({
    origin: [
      'http://localhost:5173',
      'https://*.pages.dev',
      'https://*.cloudflare.com',
    ],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

// Middleware to count requests
app.use('/api/*', async (c, next) => {
  requestCount++
  await next()
})

app.get('/', c => {
  return c.text('Hello Hono!')
})

app.get('/api/health', c => {
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000) // uptime in seconds
  const responseTime = Math.random() * 50 + 10 // simulate response time 10-60ms

  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stats: {
      uptime,
      responseTime: Math.round(responseTime * 100) / 100,
      requestCount,
    },
  })
})

app.get('/api/logs', c => {
  // Add some sample logs if empty
  if (logs.length === 0) {
    logs.push(`[${new Date().toISOString()}] Server started`)
    logs.push(`[${new Date().toISOString()}] Health check endpoint initialized`)
    logs.push(`[${new Date().toISOString()}] CORS middleware configured`)
  }

  // Return last 20 logs
  const recentLogs = logs.slice(-20)

  return c.json({
    logs: recentLogs,
    total: logs.length,
  })
})

app.post('/api/restart', async c => {
  // Simulate restart operation
  const timestamp = new Date().toISOString()
  logs.push(`[${timestamp}] Service restart initiated`)

  // In a real app, this would trigger actual restart
  // For now, just simulate success
  await new Promise(resolve => setTimeout(resolve, 1000))

  logs.push(`[${new Date().toISOString()}] Service restart completed`)

  return c.json({
    success: true,
    message: 'Service restart completed',
    timestamp: new Date().toISOString(),
  })
})

app.post('/api/deploy', async c => {
  // Simulate deployment operation
  const timestamp = new Date().toISOString()
  logs.push(`[${timestamp}] Deployment update initiated`)

  // In a real app, this would trigger actual deployment
  // For now, just simulate success
  await new Promise(resolve => setTimeout(resolve, 2000))

  logs.push(
    `[${new Date().toISOString()}] Deployment update completed successfully`
  )

  return c.json({
    success: true,
    message: 'Deployment update completed',
    timestamp: new Date().toISOString(),
  })
})

// Todo API endpoints
app.get('/api/todos', async c => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM todos ORDER BY created_at DESC'
    ).all()

    return c.json(results)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return c.json({ error: 'Failed to fetch todos' }, 500)
  }
})

app.post('/api/todos', async c => {
  try {
    const { text }: { text: string } = await c.req.json()

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return c.json({ error: 'Text is required' }, 400)
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await c.env.DB.prepare(
      'INSERT INTO todos (id, text, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, text.trim(), false, now, now)
      .run()

    const todo = {
      id,
      text: text.trim(),
      completed: false,
      created_at: now,
      updated_at: now,
    }

    return c.json(todo, 201)
  } catch (error) {
    console.error('Error creating todo:', error)
    return c.json({ error: 'Failed to create todo' }, 500)
  }
})

app.put('/api/todos/:id', async c => {
  try {
    const id = c.req.param('id')
    const { text, completed }: { text?: string; completed?: boolean } =
      await c.req.json()

    if (
      text !== undefined &&
      (!text || typeof text !== 'string' || text.trim().length === 0)
    ) {
      return c.json({ error: 'Text cannot be empty' }, 400)
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return c.json({ error: 'Completed must be a boolean' }, 400)
    }

    // Check if todo exists
    const existing = await c.env.DB.prepare('SELECT * FROM todos WHERE id = ?')
      .bind(id)
      .first()

    if (!existing) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    const updates: string[] = []
    const values: any[] = []

    if (text !== undefined) {
      updates.push('text = ?')
      values.push(text.trim())
    }

    if (completed !== undefined) {
      updates.push('completed = ?')
      values.push(completed)
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?')
      values.push(new Date().toISOString())

      await c.env.DB.prepare(
        `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`
      )
        .bind(...values, id)
        .run()
    }

    // Fetch updated todo
    const updated = await c.env.DB.prepare('SELECT * FROM todos WHERE id = ?')
      .bind(id)
      .first()

    return c.json(updated)
  } catch (error) {
    console.error('Error updating todo:', error)
    return c.json({ error: 'Failed to update todo' }, 500)
  }
})

app.delete('/api/todos/:id', async c => {
  try {
    const id = c.req.param('id')

    const result = await c.env.DB.prepare('DELETE FROM todos WHERE id = ?')
      .bind(id)
      .run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return c.json({ error: 'Failed to delete todo' }, 500)
  }
})

export default app
