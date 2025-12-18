// Shared utility functions

/**
 * Format a date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString()
}

/**
 * Simple delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Type-safe error handling
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Get error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message
  return String(error)
}
