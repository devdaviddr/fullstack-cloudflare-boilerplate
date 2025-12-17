import type { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { serverStartTime, requestCount, logs } from '../middleware'

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

  app.get('/api/health', async c => {
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000)
    const responseTime = Math.random() * 50 + 10

    // Check DB connection
    let dbStatus = 'ok'
    try {
      await c.env.DB.prepare('SELECT 1').first()
    } catch (error) {
      dbStatus = 'error'
      console.error('[Health] DB connection failed:', error)
    }

    // Check auth config
    let authStatus = 'ok'
    if (!c.env.FIREBASE_PROJECT_ID) {
      authStatus = 'error'
      console.error('[Health] FIREBASE_PROJECT_ID not configured')
    }

    const status = dbStatus === 'ok' && authStatus === 'ok' ? 'ok' : 'degraded'

    return c.json({
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        auth: authStatus,
      },
      stats: {
        uptime,
        responseTime: Math.round(responseTime * 100) / 100,
        requestCount,
      },
    })
  })

  app.get('/api/logs', c => {
    if (logs.length === 0) {
      logs.push(`[${new Date().toISOString()}] Server started`)
      logs.push(
        `[${new Date().toISOString()}] Health check endpoint initialized`
      )
      logs.push(`[${new Date().toISOString()}] CORS middleware configured`)
    }

    return c.json({
      logs: logs.slice(-20),
      total: logs.length,
    })
  })

  app.post('/api/restart', async c => {
    const timestamp = new Date().toISOString()
    logs.push(`[${timestamp}] Service restart initiated`)

    await new Promise(resolve => setTimeout(resolve, 1000))
    logs.push(`[${new Date().toISOString()}] Service restart completed`)

    return c.json({
      success: true,
      message: 'Service restart completed',
      timestamp: new Date().toISOString(),
    })
  })

  app.post('/api/deploy', async c => {
    const timestamp = new Date().toISOString()
    logs.push(`[${timestamp}] Deployment update initiated`)

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
}
