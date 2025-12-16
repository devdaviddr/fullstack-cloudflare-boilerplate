import { useQuery } from '@tanstack/react-query'
import { api, HealthResponse } from '../lib/api'

export const useHealth = () => {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await api.get('/health')
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}