import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VIDEO_GEN_API_KEY': JSON.stringify(
      process.env.VIDEO_GEN_API_KEY || ''
    ),
    'import.meta.env.VIDEO_GEN_API_KEY': JSON.stringify(
      process.env.VIDEO_GEN_API_KEY || ''
    ),
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
})
