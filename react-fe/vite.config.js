import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy FE -> Laravel API
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Tidak perlu rewrite; Laravel sudah di bawah /api
      }
    },
    cors: {
      origin: 'http://localhost:5173',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'X-Requested-With, Content-Type, Authorization, X-XSRF-TOKEN'
    }
  },
  // Enable source maps for better debugging
  build: {
    sourcemap: true,
  },
  // Development server settings
  preview: {
    port: 5173,
    strictPort: true,
  },
  // Environment variables
  define: {
    'process.env': {}
  }
});
