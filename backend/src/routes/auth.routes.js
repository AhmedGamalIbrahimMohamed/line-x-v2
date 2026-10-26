import { Router } from 'express';
import { changePassword, login, logout, me, refresh } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rate-limit.js';
import { validate } from '../middleware/validate.js';
import { changePasswordSchema, loginSchema } from '../validators/schemas.js';

export const authRoutes = Router();

authRoutes.post('/login', loginLimiter, validate(loginSchema), login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
authRoutes.get('/me', requireAuth, me);
authRoutes.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);
