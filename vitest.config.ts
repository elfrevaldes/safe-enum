import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        '**/index.ts',
        '**/*.test.ts',
        '**/*.d.ts',
        '**/types/**',
        '**/dist/**',
        '**/node_modules/**',
      ],
      reportsDirectory: 'coverage',
      reporter: ['text', 'json', 'html', 'lcov'],
      all: true,
    },
  },
});
