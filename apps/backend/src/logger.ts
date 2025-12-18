import winston from 'winston'

// Environment-based log level
const logLevel = process.env.LOG_LEVEL || 'info'

// Conditional logging based on environment
const isProduction = process.env.NODE_ENV === 'production'
const enableVerboseLogging = process.env.ENABLE_VERBOSE_LOGGING === 'true'

// Create logger with conditional transports
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fullstack-backend' },
  transports: [
    // Always include console transport for Cloudflare Workers
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

// Conditionally add additional transports only if verbose logging is enabled
if (enableVerboseLogging && !isProduction) {
  // Could add file transport or other transports here if needed
  // For now, keeping minimal to reduce bundle size
}

// Add request ID to log context if available
export const withRequestId = (requestId?: string) => {
  return requestId ? { requestId } : {}
}

export { logger }
