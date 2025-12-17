import axios from 'axios'
import { auth } from './firebase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8788',
  timeout: 10000,
})

// Add request interceptor to include Firebase auth token
api.interceptors.request.use(async config => {
  try {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
      console.log('[API] Request with auth token for user:', user.email)
    } else {
      console.warn('[API] No authenticated user found for request')
    }
  } catch (error) {
    console.error('[API] Error getting auth token:', error)
  }
  return config
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log errors in development
    console.error('[API] Error:', error)

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('[API] Authentication error - token may be expired or invalid')
      console.error('[API] Error details:', error.response?.data)
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('[API] Network error - backend may not be running')
      console.error('[API] Check if backend is running at:', api.defaults.baseURL)
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
