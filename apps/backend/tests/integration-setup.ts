import { beforeAll, afterAll, afterEach, vi } from 'vitest'

// Mock winston to avoid Node.js compatibility issues in Cloudflare Workers
vi.mock('../src/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
  withRequestId: vi.fn(requestId => ({ requestId })),
}))

// Start server before all tests
beforeAll(() => {
  // No MSW setup for integration tests
})

// Reset handlers after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Clean up after all tests
afterAll(() => {
  // No MSW cleanup
})
