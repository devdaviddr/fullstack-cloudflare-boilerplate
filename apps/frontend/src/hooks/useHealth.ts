import { useQuery } from '@tanstack/react-query'
import { api, HealthResponse } from '../lib/api'

interface ApiError {
  message: string
  status: number
  data?: unknown
}

export const useHealth = () => {
  return useQuery<HealthResponse, ApiError>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await api.get('/health')
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors or 5xx server errors
      if (failureCount >= 3) return false
      if (error.status >= 500) return true
      if (!error.status) return true // Network errors
      return false // Don't retry for client errors (4xx)
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}
