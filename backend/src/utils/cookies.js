import { env } from '../config/env.js';

export const REFRESH_COOKIE = 'xl_rt';

/** Reads one cookie from the request without pulling in a cookie-parser dependency. */
export function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** '30d' | '12h' | '45m' | seconds → milliseconds (falls back to 30 days). */
export function durationToMs(value, fallback = 30 * 24 * 60 * 60 * 1000) {
  const match = /^(\d+)\s*([smhd])?$/.exec(String(value).trim());
  if (!match) return fallback;
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] || 's'];
  return Number(match[1]) * unit;
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  // Only the auth endpoints ever need to see the refresh token.
  path: `${env.apiPrefix}/auth`,
});

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions(), maxAge: durationToMs(env.jwt.refreshExpiresIn) });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
}
