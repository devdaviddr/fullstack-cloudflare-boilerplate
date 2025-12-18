// Simple logger compatible with Cloudflare Workers
const isProduction = process.env.NODE_ENV === 'production'
const enableVerboseLogging = process.env.ENABLE_VERBOSE_LOGGING === 'true'
const logLevel = process.env.LOG_LEVEL || 'info'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const currentLevel = levels[logLevel as keyof typeof levels] || 2

const logger = {
  error: (message: string, meta?: any) => {
    if (currentLevel >= 0) {
      console.error(`[ERROR] ${message}`, meta || '')
    }
  },
  warn: (message: string, meta?: any) => {
    if (currentLevel >= 1) {
      console.warn(`[WARN] ${message}`, meta || '')
    }
  },
  info: (message: string, meta?: any) => {
    if (currentLevel >= 2) {
      console.info(`[INFO] ${message}`, meta || '')
    }
  },
  debug: (message: string, meta?: any) => {
    if (currentLevel >= 3) {
      console.debug(`[DEBUG] ${message}`, meta || '')
    }
  },
}

// Add request ID to log context if available
export const withRequestId = (requestId?: string) => {
  return requestId ? { requestId } : {}
}

export { logger }
