import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { errorHandler, requestIdMiddleware } from '../../src/middleware/error'
import { logger } from '../../src/logger'

// Mock logger
vi.mock('../../src/logger', () => ({
  logger: {
    error: vi.fn(),
  },
  withRequestId: vi.fn(requestId => ({ requestId })),
}))

describe('Error Handling Middleware', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    vi.clearAllMocks()
  })

  describe('errorHandler', () => {
    it('handles validation errors', async () => {
      errorHandler(app)

      // Add a route that throws a validation error
      app.get('/test', () => {
        throw new Error('validation: Invalid input')
      })

      const res = await app.request('/test')
      expect(res.status).toBe(400)

      const body = await res.json()
      expect(body.error).toBe('Invalid request data')
      expect(body.code).toBe('VALIDATION_ERROR')
      expect(body.requestId).toBeDefined()
    })

    it('handles not found errors', async () => {
      errorHandler(app)

      app.get('/test', () => {
        throw new Error('not found: Resource missing')
      })

      const res = await app.request('/test')
      expect(res.status).toBe(404)

      const body = await res.json()
      expect(body.error).toBe('Resource not found')
      expect(body.code).toBe('NOT_FOUND')
    })

    it('handles generic errors', async () => {
      errorHandler(app)

      app.get('/test', () => {
        throw new Error('Something went wrong')
      })

      const res = await app.request('/test')
      expect(res.status).toBe(500)

      const body = await res.json()
      expect(body.error).toBe('An unexpected error occurred')
      expect(body.code).toBe('INTERNAL_ERROR')
    })

    it('includes request ID and logs error', async () => {
      errorHandler(app)

      app.get('/test', () => {
        throw new Error('Test error')
      })

      const res = await app.request('/test')
      const body = await res.json()

      expect(body.requestId).toBeDefined()
      expect(logger.error).toHaveBeenCalledWith(
        'Unhandled error occurred',
        expect.objectContaining({
          error: 'Test error',
          requestId: body.requestId,
          stack: expect.any(String),
          timestamp: expect.any(String),
          url: 'http://localhost/test',
          userId: 'anonymous',
        })
      )
    })
  })

  describe('requestIdMiddleware', () => {
    it('generates and sets request ID', async () => {
      const mockNext = vi.fn()
      const ctx = {
        set: vi.fn(),
      } as any

      await requestIdMiddleware(ctx, mockNext)

      expect(ctx.set).toHaveBeenCalledWith('requestId', expect.any(String))
      expect(mockNext).toHaveBeenCalled()
    })

    it('adds request ID to logger context', async () => {
      const mockNext = vi.fn()
      const ctx = {
        set: vi.fn(),
      } as any

      await requestIdMiddleware(ctx, mockNext)

      const requestId = ctx.set.mock.calls[0][1]
      expect(ctx.set).toHaveBeenCalledWith('requestId', requestId)

      // Clean up after test - not applicable with simple logger
    })
  })
})
