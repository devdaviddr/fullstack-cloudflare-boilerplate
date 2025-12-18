/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        name: 'unit',
        test: {
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
          globals: true,
          setupFiles: ['./tests/setup.ts'],
        },
      },
      {
        name: 'integration',
        test: {
          pool: '@cloudflare/vitest-pool-workers',
          poolOptions: {
            workers: {
              wrangler: {
                configPath: './wrangler.toml',
              },
            },
          },
          include: ['tests/integration/**/*.test.ts'],
          globals: true,
          setupFiles: ['./tests/integration-setup.ts'],
        },
      },
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
