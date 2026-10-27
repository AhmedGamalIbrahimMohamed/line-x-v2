import fs from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  // Behind a proxy / platform load balancer, so req.ip and the rate limiter
  // read the real client address rather than the proxy's.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // The API only serves JSON and images; the Angular site is hosted elsewhere.
      contentSecurityPolicy: false,
      // Uploaded images are embedded by the site on a different origin.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin requests, curl and server-to-server calls send no Origin.
        if (!origin) return callback(null, true);
        if (env.cors.origins.includes(origin)) return callback(null, true);
        // `false` withholds the CORS headers (the browser blocks the call) without turning a
        // disallowed origin into a 500 and an error-log entry.
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use(compression());
  // Project documents are large nested JSON, but images are uploaded separately.
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  app.use(
    env.storage.route,
    express.static(path.resolve(process.cwd(), env.storage.directory), {
      maxAge: '365d',
      immutable: true,
      index: false,
      dotfiles: 'deny',
    }),
  );

  app.use(env.apiPrefix, apiLimiter, apiRouter);

  // On hosting plans that route the whole domain to this process, serve the Angular build too
  // (with SPA fallback) instead of just an API welcome message at every non-API path.
  const indexHtml = env.frontendDir && path.join(env.frontendDir, 'index.html');
  if (indexHtml && fs.existsSync(indexHtml)) {
    app.use(express.static(env.frontendDir, { index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith(env.apiPrefix) || req.path.startsWith(env.storage.route)) return next();
      res.sendFile(indexHtml);
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({ success: true, data: { name: 'X-Line API', docs: `${env.apiPrefix}/health` } });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
