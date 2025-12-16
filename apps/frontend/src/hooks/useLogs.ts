import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { LogsResponse } from '../lib/api'

export function useLogs() {
  return useQuery({
    queryKey: ['logs'],
    queryFn: async (): Promise<LogsResponse> => {
      const response = await api.get('/logs')
      return response.data
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
