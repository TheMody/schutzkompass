import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web'),
      '@schutzkompass/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@schutzkompass/compliance-content': path.resolve(__dirname, 'packages/compliance-content/src'),
      '@schutzkompass/ui': path.resolve(__dirname, 'packages/ui/src'),
    },
  },
});
