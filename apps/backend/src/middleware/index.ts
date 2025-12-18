import { cors } from 'hono/cors'
import type { Hono } from 'hono'
import type { Env, Variables } from '../types'

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