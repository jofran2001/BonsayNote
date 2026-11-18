import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import apiApp from './api/index.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'bonsai-express-api',
      configureServer(server) {
        server.middlewares.use(apiApp);
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});

