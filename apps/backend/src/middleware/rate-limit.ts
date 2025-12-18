// Simple in-memory rate limiter for Cloudflare Workers
// In production, consider using Cloudflare Rate Limiting or Upstash

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

export const rateLimitMiddleware = async (c: any, next: any) => {
  const ip =
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Forwarded-For') ||
    c.req.header('X-Real-IP') ||
    'anonymous'

  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Get or create rate limit entry
  let entry = rateLimitStore.get(ip)
  if (!entry || entry.resetTime < windowStart) {
    entry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW }
  }

  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    c.header('X-RateLimit-Reset', new Date(entry.resetTime).toISOString())
    c.header(
      'Retry-After',
      Math.ceil((entry.resetTime - now) / 1000).toString()
    )

    return c.json(
      {
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        reset: new Date(entry.resetTime).toISOString(),
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      },
      429
    )
  }

  // Increment counter
  entry.count++
  rateLimitStore.set(ip, entry)

  // Add rate limit headers
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count)
  c.header('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString())
  c.header('X-RateLimit-Remaining', remaining.toString())
  c.header('X-RateLimit-Reset', new Date(entry.resetTime).toISOString())

  await next()

  // Clean up old entries periodically (simple cleanup)
  if (Math.random() < 0.01) {
    // 1% chance per request
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }
}
