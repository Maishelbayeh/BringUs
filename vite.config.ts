import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5174'),
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5174'),
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'bringus.onrender.com',
      '.onrender.com'
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material', '@heroicons/react'],
          charts: ['recharts', '@nivo/pie'],
          utils: ['axios', 'dayjs', 'react-i18next'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
