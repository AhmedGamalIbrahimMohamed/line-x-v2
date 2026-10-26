import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken } from '../middleware/auth.js';
import { REFRESH_COOKIE, clearRefreshCookie, readCookie, setRefreshCookie } from '../utils/cookies.js';
import { ApiError, asyncHandler } from '../utils/errors.js';

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  lastLogin: user.lastLogin,
});

/** Sets the refresh cookie and returns the body: the short-lived access token stays in memory client-side. */
function startSession(res, user) {
  setRefreshCookie(res, signRefreshToken(user));
  return {
    user: publicUser(user),
    accessToken: signAccessToken(user),
    expiresIn: env.jwt.expiresIn,
  };
}

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Compare against a dummy hash when the account is missing so the response
  // time does not reveal whether the email exists.
  const hash = user?.password || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
  const passwordMatches = await bcrypt.compare(password, hash);

  if (!user || !passwordMatches) throw ApiError.unauthorized('Incorrect email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

  const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  res.json({ success: true, data: startSession(res, updated) });
});

/** POST /api/auth/refresh — reads the httpOnly refresh cookie, rotates it and issues a new access token. */
export const refresh = asyncHandler(async (req, res) => {
  const token = readCookie(req, REFRESH_COOKIE);
  if (!token) throw ApiError.unauthorized('No active session');

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.refreshSecret);
  } catch {
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Session has expired, please sign in again');
  }
  if (payload.type !== 'refresh') throw ApiError.unauthorized('Wrong token type');

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Account is no longer active');
  }

  res.json({ success: true, data: startSession(res, user) });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  clearRefreshCookie(res);
  res.json({ success: true, data: { message: 'Signed out' } });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: publicUser(user) });
});

/** POST /api/auth/change-password */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw ApiError.notFound('User not found');

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    // 400, not 401: the session is fine, the request is wrong (a 401 would make clients refresh and retry).
    throw ApiError.badRequest('Current password is incorrect');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 12) },
  });

  res.json({ success: true, data: { message: 'Password updated' } });
});
