import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

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

app.get('/', c => {
  return c.text('Hello Hono!')
})

app.get('/api/health', c => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
