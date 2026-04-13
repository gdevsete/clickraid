import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Remove all console.* and debugger statements in production
    drop: ['console', 'debugger'],
  },
  build: {
    sourcemap: false, // No source maps in production
  },
})
