import axios from 'axios'
import { auth } from './firebase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

// Add request interceptor to include Firebase auth token
api.interceptors.request.use(async config => {
  try {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.error('Error getting auth token:', error)
  }
  return config
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log errors in development
    console.error('API Error:', error)

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token might be expired, try to refresh
      console.log('Authentication error - token may be expired')
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

export interface LogsResponse {
  logs: string[]
  total: number
}

export interface ActionResponse {
  success: boolean
  message: string
  timestamp: string
}

export interface HealthResponse {
  status: string
  timestamp: string
  stats: {
    uptime: number
    responseTime: number
    requestCount: number
  }
}

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
