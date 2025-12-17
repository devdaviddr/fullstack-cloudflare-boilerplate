import { cors } from 'hono/cors'
import type { Hono } from 'hono'
import type { Env, Variables } from '../types'

// Track server metrics
export const serverStartTime = Date.now()
export let requestCount = 0
export const logs: string[] = []

/**
 * Configure CORS middleware
 */
export function setupCors(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  app.use(
    '*',
    cors({
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://*.pages.dev',
        'https://*.cloudflare.com',
      ],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    })
  )
}

/**
 * Request counter middleware
 */
export function setupRequestCounter(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  app.use('/api/*', async (_c, next) => {
    requestCount++
    await next()
  })
}