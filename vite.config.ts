import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  resolve: {
    alias: {
      '@/components/ui': path.resolve(__dirname, 'registry/new-york/ui'),
      '@/lib/utils': path.resolve(__dirname, 'registry/test-support/utils.ts'),
    },
  },
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
              res.setHeader('Content-Type', filePath.endsWith('.js') ? 'text/javascript' : 'text/css');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          // Swiper's bundle, as a page without a build vendors it (showcase/static-gallery.html).
          if (urlPath.startsWith('/vendor/swiper/')) {
            const filePath = path.resolve(__dirname, 'node_modules/swiper', path.basename(urlPath));
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', filePath.endsWith('.js') ? 'text/javascript' : 'text/css');
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
  // Swiper is only reached from pages Vite does not scan at start (fixtures.html): bundle it up
  // front, so its first request does not re-optimize and reload the page under a test.
  optimizeDeps: { include: ['swiper', 'swiper/modules'] },
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
