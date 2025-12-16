import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, Todo, CreateTodoRequest, UpdateTodoRequest } from '../lib/api'

interface ApiError {
  message: string
  status: number
  data?: unknown
}

export const useTodos = () => {
  return useQuery<Todo[], ApiError>({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await api.get('/todos')
      return response.data
    },
  })
}

export const useCreateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation<Todo, ApiError, CreateTodoRequest>({
    mutationFn: async (data: CreateTodoRequest) => {
      const response = await api.post('/todos', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useUpdateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation<Todo, ApiError, { id: string; data: UpdateTodoRequest }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/todos/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useDeleteTodo = () => {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/todos/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
