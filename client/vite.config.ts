import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import path from 'path' // For path resolution

// https://vite.dev/config/
export default defineConfig({
  root: '.', // Explicitly set root to the current directory (client)
  base: '/bms-digital-signage/', // Set base path for GitHub Pages
  publicDir: 'public', // Explicitly set public directory relative to root
  build: {
    outDir: '../docs', // Output to docs folder at the repository root
    emptyOutDir: true, // Ensure the output directory is emptied before build
  },
  plugins: [
    react(),
    // Tailwind CSS is now handled by PostCSS
  ],
  resolve: {
    alias: {
      // Define alias based on tsconfig.app.json baseUrl and paths
      '@': path.resolve(__dirname, './src'),
      '@admin': path.resolve(__dirname, './src/admin'), // Update alias to point inside src
    }
  }
})
