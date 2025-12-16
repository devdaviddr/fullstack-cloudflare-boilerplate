import '@testing-library/jest-dom'
import { QueryClient } from '@tanstack/react-query'

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Set up global test utilities
global.createTestQueryClient = createTestQueryClient
