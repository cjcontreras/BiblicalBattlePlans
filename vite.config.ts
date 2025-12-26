import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    // Configure preview server to handle SPA routing
    port: 4173,
    strictPort: false,
  },
  server: {
    // Configure dev server to handle SPA routing
    port: 5173,
    strictPort: false,
  },
})
