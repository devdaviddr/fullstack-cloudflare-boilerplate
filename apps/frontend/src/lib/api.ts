import axios from 'axios'
import { auth } from './firebase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8788',
  timeout: 10000,
})

// Add request interceptor to include Firebase auth token
api.interceptors.request.use(async config => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  async error => {
    // Handle authentication errors with retry
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      const user = auth.currentUser
      if (user) {
        const newToken = await user.getIdToken(true) // Force refresh
        error.config.headers.Authorization = `Bearer ${newToken}`
        return api.request(error.config) // Retry the request
      }
    }

    // Return a standardized error
    return Promise.reject({
      message:
        error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data,
    })
  }
)

export interface Todo {
  id: string
  text: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface CreateTodoRequest {
  text: string
}

export interface UpdateTodoRequest {
  text?: string
  completed?: boolean
}
