import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/actuator': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk
          'antd': ['antd'],
          // API and utilities chunk
          'utils': ['axios']
        }
      }
    },
    // Compress output with default minifier
    minify: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 500
  }
})
