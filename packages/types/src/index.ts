// Shared types for the monorepo

export interface ApiResponse<T = any> {
  data: T
  message?: string
}

export interface HealthCheck {
  status: string
  timestamp: string
}