import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/errors.js';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

function readBearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

const userSelect = { id: true, email: true, name: true, role: true, isActive: true };

/**
 * Verifies the access token and re-reads the user, so a deactivated account
 * loses access immediately rather than when its token expires.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = readBearer(req);
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch (error) {
    throw ApiError.unauthorized(
      error.name === 'TokenExpiredError' ? 'Session expired, please sign in again' : 'Invalid token',
    );
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: userSelect });
  if (!user || !user.isActive) throw ApiError.unauthorized('Account is no longer active');

  req.user = user;
  next();
});

/**
 * Use after `optionalAuth` + query validation: asking for drafts explicitly
 * (`includeUnpublished=true`) requires a valid session, so an expired token
 * surfaces as a 401 instead of a quietly incomplete result.
 */
export const requireAuthForDrafts = (req, _res, next) => {
  if (req.validatedQuery?.includeUnpublished === 'true' && !req.user) {
    return next(ApiError.unauthorized('Sign in to view unpublished projects'));
  }
  return next();
};

/**
 * Attaches `req.user` when a valid token is present but never rejects. Used on
 * public reads so signed-in staff can see unpublished drafts.
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = readBearer(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: userSelect });
    if (user?.isActive) req.user = user;
  } catch {
    // Ignore — the request simply continues as an anonymous visitor.
  }
  return next();
});
