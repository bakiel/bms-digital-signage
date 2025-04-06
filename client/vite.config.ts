import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: '.', // Explicitly set root to the current directory (client)
  publicDir: 'public', // Explicitly set public directory relative to root
  plugins: [react()],
  resolve: {
    alias: {
      // Optional: Define alias if needed, e.g., for src
      // '@': path.resolve(__dirname, './src'),
    }
  }
})
