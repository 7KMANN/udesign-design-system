import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-tokens',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Remove query params (like cache busters) for file path mapping
          const urlPath = req.url ? req.url.split('?')[0] : '';
          
          if (urlPath.startsWith('/dist/')) {
            const filePath = path.resolve(__dirname, 'dist', urlPath.slice(6));
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/css');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          if (urlPath.startsWith('/history/')) {
            const filePath = path.resolve(__dirname, 'history', urlPath.slice(9));
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/css');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  root: path.resolve(__dirname, 'showcase'),
  build: {
    outDir: path.resolve(__dirname, 'dist-showcase'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    fs: {
      allow: ['..']
    }
  }
});
