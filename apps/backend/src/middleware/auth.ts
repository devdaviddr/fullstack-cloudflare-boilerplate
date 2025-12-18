import type { Context, Next } from 'hono'
import type { Env, Variables, User } from '../types'
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
export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    console.error('[Auth] Missing authorization header')
    return c.json({ error: 'Missing authorization header' }, 401)
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.error(
      '[Auth] Invalid authorization header format:',
      authHeader.substring(0, 20)
    )
    return c.json({ error: 'Invalid authorization header format' }, 401)
  }

  const token = authHeader.substring(7)
  console.log(
    '[Auth] Attempting to verify token for project:',
    c.env.FIREBASE_PROJECT_ID
  )

  try {
    const firebaseUser = await verifyFirebaseToken(
      token,
      c.env.FIREBASE_PROJECT_ID
    )
    console.log(
      '[Auth] Token verified successfully for user:',
      firebaseUser.email
    )

    // Find or create user record
    let user: User | null = (await c.env.DB.prepare(
      'SELECT id, firebase_uid, email, name FROM users WHERE firebase_uid = ?'
    )
      .bind(firebaseUser.firebase_uid)
      .first()) as User | null

    if (!user) {
      console.log('[Auth] Creating new user record for:', firebaseUser.email)
      const userId = crypto.randomUUID()
      const now = new Date().toISOString()

      await c.env.DB.prepare(
        'INSERT INTO users (id, firebase_uid, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(
          userId,
          firebaseUser.firebase_uid,
          firebaseUser.email,
          firebaseUser.name,
          now,
          now
        )
        .run()

      user = {
        id: userId,
        firebase_uid: firebaseUser.firebase_uid,
        email: firebaseUser.email,
        name: firebaseUser.name,
      }
    } else {
      console.log('[Auth] Found existing user record for:', firebaseUser.email)
    }

    c.set('user', user)
    await next()
  } catch (error) {
    let message = 'Authentication failed'
    let code = 'AUTH_FAILED'

    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        message = 'Authentication failed'
        code = 'TOKEN_EXPIRED'
      } else if (error.message.includes('audience')) {
        message = 'Authentication failed'
        code = 'INVALID_TOKEN'
      } else if (error.message.includes('issuer')) {
        message = 'Authentication failed'
        code = 'INVALID_TOKEN'
      } else if (error.message.includes('signature')) {
        message = 'Authentication failed'
        code = 'INVALID_TOKEN'
      }
    }

    console.error(
      '[Auth] Token verification failed:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return c.json({ error: message, code }, 401)
  }
}
