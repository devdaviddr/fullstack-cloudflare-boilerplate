import type { Context, Next } from 'hono'
import type { Env, Variables } from '../types'
import { verifyFirebaseToken } from '../auth/firebase'

/**
 * Authentication middleware
 * Verifies Firebase ID token and adds user info to context
 *
 * Usage:
 *   app.get('/protected', authMiddleware, async (c) => {
 *     const user = c.get('user')
 *     return c.json({ userId: user.uid })
 *   })
 */
export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    console.error('[Auth] Missing authorization header')
    return c.json({ error: 'Missing authorization header' }, 401)
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.error('[Auth] Invalid authorization header format:', authHeader.substring(0, 20))
    return c.json({ error: 'Invalid authorization header format' }, 401)
  }

  const token = authHeader.substring(7)
  console.log('[Auth] Attempting to verify token for project:', c.env.FIREBASE_PROJECT_ID)

  try {
    const user = await verifyFirebaseToken(
      token,
      c.env.FIREBASE_PROJECT_ID,
      c.env.FIREBASE_CLIENT_EMAIL,
      c.env.FIREBASE_PRIVATE_KEY
    )
    console.log('[Auth] Token verified successfully for user:', user.email)
    c.set('user', user)
    await next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed'
    console.error('[Auth] Token verification failed:', message)
    return c.json({ error: message }, 401)
  }
}