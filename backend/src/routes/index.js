import { Router } from 'express';
import { env } from '../config/env.js';
import { authRoutes } from './auth.routes.js';
import { projectRoutes } from './projects.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: { service: 'x-line-api', status: 'ok', environment: env.nodeEnv, time: new Date().toISOString() },
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
