import { z } from 'zod'

// Todo schemas
export const CreateTodoSchema = z.object({
  text: z
    .string()
    .min(1, 'Todo text is required')
    .max(500, 'Todo text must be less than 500 characters')
    .trim(),
})

export const UpdateTodoSchema = z
  .object({
    completed: z.boolean().optional(),
    text: z
      .string()
      .min(1, 'Todo text is required')
      .max(500, 'Todo text must be less than 500 characters')
      .trim()
      .optional(),
  })
  .refine(data => data.completed !== undefined || data.text !== undefined, {
    message: 'At least one field must be provided for update',
  })

// Auth schemas
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email must be less than 254 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
})

export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email must be less than 254 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
})

// Query parameter schemas
export const TodoQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .refine(val => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
  offset: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0))
    .refine(val => val >= 0, 'Offset must be non-negative'),
  completed: z
    .string()
    .optional()
    .transform(val => (val ? val === 'true' : undefined))
    .optional(),
  sort: z
    .enum(['created_at', 'updated_at', 'text'])
    .optional()
    .default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  requestId: z.string().optional(),
  details: z.any().optional(),
})
