import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ActionResponse } from '../lib/api'

export function useRestartService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<ActionResponse> => {
      const response = await api.post('/restart')
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch logs after restart
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      queryClient.invalidateQueries({ queryKey: ['health'] })
    },
  })
}

export function useDeployUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<ActionResponse> => {
      const response = await api.post('/deploy')
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch logs after deployment
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      queryClient.invalidateQueries({ queryKey: ['health'] })
    },
  })
}
