import { beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock Firebase public key endpoint for tests
const firebasePublicKeyHandler = http.get(
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
  () => {
    return HttpResponse.json({
      'test-key-id':
        '-----BEGIN CERTIFICATE-----\ntest-cert\n-----END CERTIFICATE-----',
    })
  }
)

export const server = setupServer(firebasePublicKeyHandler)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())
