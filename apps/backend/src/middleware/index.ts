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
      origin: (origin) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return null

        // Allow localhost for development
        if (origin.startsWith('http://localhost:')) return origin

        // Allow Cloudflare Pages domains
        if (origin.startsWith('https://') && origin.endsWith('.pages.dev')) return origin

        // Allow Cloudflare domains
        if (origin.includes('cloudflare.com')) return origin

        // Deny all other origins
        return null
      },
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    })
  )
}