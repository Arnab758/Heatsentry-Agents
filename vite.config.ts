import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { handleApiRequest } from './src/lib/serverApi';

dotenv.config();

function heatsentryApiPlugin(): Plugin {
  return {
    name: 'heatsentry-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        let body = '';
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            let parsedBody = {};
            try {
              if (body) parsedBody = JSON.parse(body);
            } catch {
              parsedBody = {};
            }

            const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
            const result = await handleApiRequest(
              urlObj.pathname,
              req.method || 'GET',
              urlObj.searchParams,
              parsedBody
            );

            if (result.contentType && result.buffer) {
              res.setHeader('Content-Type', result.contentType);
              res.setHeader('X-Engine', 'HeatSentry-Node-Engine');
              res.statusCode = result.status;
              res.end(result.buffer);
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Engine', 'HeatSentry-Node-Engine');
            res.statusCode = result.status;
            res.end(JSON.stringify(result.data));
          });
          return;
        }

        // GET / OPTIONS / HEAD
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.statusCode = 204;
          res.end();
          return;
        }

        const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        const result = await handleApiRequest(
          urlObj.pathname,
          req.method || 'GET',
          urlObj.searchParams,
          {}
        );

        if (result.contentType && result.buffer) {
          res.setHeader('Content-Type', result.contentType);
          res.setHeader('X-Engine', 'HeatSentry-Node-Engine');
          res.statusCode = result.status;
          res.end(result.buffer);
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Engine', 'HeatSentry-Node-Engine');
        res.statusCode = result.status;
        res.end(JSON.stringify(result.data));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), heatsentryApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
