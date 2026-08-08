import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors the `@/*` path alias in tsconfig.json
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    // Testing Library registers its auto-cleanup through a global afterEach. Without
    // this every render() stays mounted, so later tests see elements from earlier ones
    // and getByText reports "found multiple elements".
    globals: true,
  },
})
