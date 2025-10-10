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
      // Proxy untuk semua request ke DSpace API
      '^/server/api/.*': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          // Handle CORS preflight requests
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxying request to DSpace:', req.method, req.url);
            // Tambahkan header CORS
            proxyReq.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            proxyReq.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, X-XSRF-TOKEN');
            proxyReq.setHeader('Access-Control-Allow-Credentials', 'true');
            
            // Handle preflight requests
            if (req.method === 'OPTIONS') {
              proxyReq.method = 'OPTIONS';
              proxyReq.setHeader('Access-Control-Max-Age', '1728000');
              proxyReq.end();
              return;
            }
            
            // Handle POST data
            if (req.method === 'POST' && req.body) {
              let bodyData = req.body;
              if (typeof bodyData === 'object') {
                bodyData = Object.keys(bodyData)
                  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(bodyData[key])}`)
                  .join('&');
                proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
              }
            }
          });
          
          // Handle response
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received response from DSpace:', proxyRes.statusCode, req.url);
            // Tambahkan header CORS ke response
            proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Authorization, X-XSRF-TOKEN';
          });
          
          // Handle errors
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Credentials': 'true'
              });
            }
            res.end(JSON.stringify({ error: 'Proxy error', details: err.message }));
          });
        }
      },
      // Proxy untuk path API yang lebih spesifik (fallback)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/server/api')
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
