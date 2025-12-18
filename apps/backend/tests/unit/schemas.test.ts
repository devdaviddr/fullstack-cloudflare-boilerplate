import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  LoginSchema,
  RegisterSchema,
  TodoQuerySchema,
  ErrorResponseSchema,
} from '../../src/schemas'

describe('Zod Validation Schemas', () => {
  describe('CreateTodoSchema', () => {
    it('validates correct todo creation data', () => {
      const validData = { text: 'Test todo' }
      expect(() => CreateTodoSchema.parse(validData)).not.toThrow()
      const result = CreateTodoSchema.parse(validData)
      expect(result.text).toBe('Test todo')
    })

    it('rejects empty text', () => {
      expect(() => CreateTodoSchema.parse({ text: '' })).toThrow()
      expect(() => CreateTodoSchema.parse({ text: '   ' })).toThrow()
    })

    it('rejects text too long', () => {
      const longText = 'a'.repeat(501)
      expect(() => CreateTodoSchema.parse({ text: longText })).toThrow()
    })

    it('trims whitespace', () => {
      const result = CreateTodoSchema.parse({ text: '  test  ' })
      expect(result.text).toBe('test')
    })
  })

  describe('UpdateTodoSchema', () => {
    it('validates correct update data with text', () => {
      const validData = { text: 'Updated todo' }
      expect(() => UpdateTodoSchema.parse(validData)).not.toThrow()
    })

    it('validates correct update data with completed', () => {
      const validData = { completed: true }
      expect(() => UpdateTodoSchema.parse(validData)).not.toThrow()
    })

    it('validates correct update data with both fields', () => {
      const validData = { text: 'Updated', completed: false }
      expect(() => UpdateTodoSchema.parse(validData)).not.toThrow()
    })

    it('rejects empty update', () => {
      expect(() => UpdateTodoSchema.parse({})).toThrow()
    })

    it('rejects invalid text length', () => {
      expect(() => UpdateTodoSchema.parse({ text: 'a'.repeat(501) })).toThrow()
    })
  })

  describe('LoginSchema', () => {
    it('validates correct login data', () => {
      const validData = { email: 'test@example.com', password: 'password123' }
      expect(() => LoginSchema.parse(validData)).not.toThrow()
    })

    it('rejects invalid email', () => {
      expect(() =>
        LoginSchema.parse({ email: 'invalid-email', password: 'pass' })
      ).toThrow()
    })

    it('rejects short password', () => {
      expect(() =>
        LoginSchema.parse({ email: 'test@example.com', password: '123' })
      ).toThrow()
    })
  })

  describe('RegisterSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      }
      expect(() => RegisterSchema.parse(validData)).not.toThrow()
    })

    it('enforces password complexity', () => {
      // Missing uppercase
      expect(() =>
        RegisterSchema.parse({
          email: 'test@example.com',
          password: 'password123',
        })
      ).toThrow()

      // Missing lowercase
      expect(() =>
        RegisterSchema.parse({
          email: 'test@example.com',
          password: 'PASSWORD123',
        })
      ).toThrow()

      // Missing number
      expect(() =>
        RegisterSchema.parse({
          email: 'test@example.com',
          password: 'Password',
        })
      ).toThrow()
    })
  })

  describe('TodoQuerySchema', () => {
    it('validates correct query parameters', () => {
      const validData = {
        limit: '10',
        offset: '0',
        sort: 'created_at',
        order: 'desc',
      }
      const result = TodoQuerySchema.parse(validData)
      expect(result.limit).toBe(10)
      expect(result.offset).toBe(0)
    })

    it('provides default values', () => {
      const result = TodoQuerySchema.parse({})
      expect(result.limit).toBe(10)
      expect(result.offset).toBe(0)
      expect(result.sort).toBe('created_at')
      expect(result.order).toBe('desc')
    })

    it('rejects invalid limit', () => {
      expect(() => TodoQuerySchema.parse({ limit: '0' })).toThrow()
      expect(() => TodoQuerySchema.parse({ limit: '101' })).toThrow()
    })

    it('rejects negative offset', () => {
      expect(() => TodoQuerySchema.parse({ offset: '-1' })).toThrow()
    })

    it('validates sort options', () => {
      expect(() => TodoQuerySchema.parse({ sort: 'invalid' })).toThrow()
      expect(() => TodoQuerySchema.parse({ sort: 'created_at' })).not.toThrow()
    })
  })

  describe('ErrorResponseSchema', () => {
    it('validates error response structure', () => {
      const validError = {
        error: 'Something went wrong',
        code: 'VALIDATION_ERROR',
        requestId: '123-456',
        details: { field: 'email' },
      }
      expect(() => ErrorResponseSchema.parse(validError)).not.toThrow()
    })

    it('makes optional fields truly optional', () => {
      const minimalError = { error: 'Error message' }
      expect(() => ErrorResponseSchema.parse(minimalError)).not.toThrow()
    })
  })
})
