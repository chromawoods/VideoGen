/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const apiKey =
    process.env.VIDEO_GEN_API_KEY ||
    (mode !== 'test'
      ? loadEnv(mode, process.cwd(), '').VIDEO_GEN_API_KEY
      : '') ||
    ''

  return {
    plugins: [react()],
    define: {
      'process.env.VIDEO_GEN_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VIDEO_GEN_API_KEY': JSON.stringify(apiKey),
    },
    envPrefix: ['VITE_', 'VIDEO_GEN_'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }
})
