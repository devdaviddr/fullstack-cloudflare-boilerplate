import type { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { authMiddleware } from '../middleware/auth'
import { logger } from '../logger'

export function setupAuthRoutes(
  app: Hono<{ Bindings: Env; Variables: Variables }>
) {
  /**
   * POST /auth/logout - Logout endpoint
   */
  app.post('/auth/logout', authMiddleware, async c => {
    const user = c.get('user')
    const requestId = c.get('requestId')

    // Log the logout for security monitoring
    logger.info('User logged out', {
      userId: user.id,
      requestId,
      timestamp: new Date().toISOString(),
    })

    return c.json({
      success: true,
      message: 'Logged out successfully',
      requestId,
    })
  })

  /**
   * GET /auth/me - Get current user info
   */
  app.get('/auth/me', authMiddleware, async c => {
    const user = c.get('user')
    const requestId = c.get('requestId')

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        // Don't expose sensitive data
      },
      requestId,
    })
  })
}
