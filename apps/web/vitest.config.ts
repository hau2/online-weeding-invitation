import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
