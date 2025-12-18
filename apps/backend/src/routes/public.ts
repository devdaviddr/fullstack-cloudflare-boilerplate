import type { Hono } from 'hono'
import type { Env, Variables } from '../types'

export function setupPublicRoutes(
  app: Hono<{ Bindings: Env; Variables: Variables }>
) {
  app.get('/', c => {
    return c.json({
      name: 'Fullstack Cloudflare Boilerplate API',
      version: '1.0.0',
      status: 'online',
    })
  })
}
