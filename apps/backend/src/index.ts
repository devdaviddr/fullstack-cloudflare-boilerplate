import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from './logger'
import { errorHandler, requestIdMiddleware } from './middleware/error'
import { rateLimitMiddleware } from './middleware/rate-limit'
import { securityHeadersMiddleware } from './middleware/security'
import { setupAuthRoutes } from './routes/auth'
import { setupProtectedRoutes } from './routes/todos'
import { setupPublicRoutes } from './routes/public'
import type { Env, Variables } from './types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Add request ID middleware first
app.use('*', requestIdMiddleware)

// Security headers middleware
app.use('*', securityHeadersMiddleware)

// Rate limiting middleware
app.use('*', rateLimitMiddleware)

// CORS middleware - simplified for now
app.use(
  '*',
  cors({
    origin: [
      'https://fullstack-frontend.pages.dev',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  })
)

// Global error handler
errorHandler(app as any)

// API versioning middleware
const apiVersionMiddleware = (version: string) => {
  return async (c: any, next: any) => {
    c.set('apiVersion', version)
    c.header('X-API-Version', version)
    await next()
  }
}

// Versioned routes
app.use('/v1/*', apiVersionMiddleware('v1'))

// Setup routes
setupPublicRoutes(app as any)
setupAuthRoutes(app as any)
setupProtectedRoutes(app as any)

// Health check endpoint
app.get('/health', c => {
  const requestId = c.get('requestId')
  logger.info('Health check requested', { requestId })
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    requestId,
  })
})

// Catch-all for undefined routes
app.all('*', c => {
  const requestId = c.get('requestId')
  logger.warn('Undefined route accessed', {
    requestId,
    method: c.req.method,
    url: c.req.url,
  })
  return c.json(
    {
      error: 'Route not found',
      code: 'NOT_FOUND',
      requestId,
    },
    404
  )
})

export default app
