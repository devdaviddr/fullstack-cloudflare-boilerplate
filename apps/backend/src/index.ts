import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

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

export default app
