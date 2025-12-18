import { Hono } from 'hono'
import { logger, withRequestId } from '../logger'

// Extend Hono context to include requestId
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string
    userId?: string
  }
}

// Global error handler middleware
export const errorHandler = (app: Hono) => {
  app.onError((err, c) => {
    const requestId = c.get('requestId') || 'unknown'
    const timestamp = new Date().toISOString()
    const method = c.req.method
    const url = c.req.url
    const userId = c.get('userId') || 'anonymous'

    // Log the error with context
    logger.error('Unhandled error occurred', {
      ...withRequestId(requestId),
      error: err.message,
      stack: err.stack,
      method,
      url,
      userId,
      timestamp,
    })

    // Determine error type and status code
    let statusCode = 500
    let errorCode = 'INTERNAL_ERROR'
    let userMessage = 'An unexpected error occurred'

    if (err.message.includes('validation')) {
      statusCode = 400
      errorCode = 'VALIDATION_ERROR'
      userMessage = 'Invalid request data'
    } else if (err.message.includes('not found')) {
      statusCode = 404
      errorCode = 'NOT_FOUND'
      userMessage = 'Resource not found'
    } else if (err.message.includes('unauthorized')) {
      statusCode = 401
      errorCode = 'UNAUTHORIZED'
      userMessage = 'Authentication required'
    } else if (err.message.includes('forbidden')) {
      statusCode = 403
      errorCode = 'FORBIDDEN'
      userMessage = 'Access denied'
    }

    // Return standardized error response
    return c.json(
      {
        error: userMessage,
        code: errorCode,
        requestId,
        timestamp,
      },
      statusCode
    )
  })
}

// Request ID middleware
export const requestIdMiddleware = async (c: any, next: any) => {
  // Generate unique request ID
  const requestId = crypto.randomUUID()
  c.set('requestId', requestId)

  // Add request ID to logger context for this request
  logger.defaultMeta = { ...logger.defaultMeta, requestId }

  await next()

  // Clean up after request
  delete logger.defaultMeta.requestId
}
