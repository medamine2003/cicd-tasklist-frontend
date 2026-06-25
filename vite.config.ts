/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      include: [
        'src/api/**/*.ts',
        'src/components/**/*.tsx',
        'src/hooks/**/*.ts',
      ],
      exclude: [
        'src/__tests__/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/vite-env.d.ts',
        'src/types/**',
        '**/*.config.ts',
      ],
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/junit.xml',
    },
  },
});