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
      // Proxy API requests to DSpace backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/server/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending request to DSpace:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response from DSpace:', proxyRes.statusCode, req.url);
          });
        }
      },
      // Handle authentication endpoints
      '/server/api/authn': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
    cors: true,
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
