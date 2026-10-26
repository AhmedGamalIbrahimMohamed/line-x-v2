import 'dotenv/config';

/**
 * Central, validated configuration. Nothing elsewhere reads `process.env`
 * directly, so a missing secret fails loudly at boot instead of at request time.
 */

const int = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const list = (value, fallback = []) =>
  value ? String(value).split(',').map((item) => item.trim()).filter(Boolean) : fallback;

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: int(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX || '/api',

  databaseUrl: process.env.DATABASE_URL,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cors: {
    origins: list(process.env.CORS_ORIGINS, ['http://localhost:4200', 'http://127.0.0.1:4200']),
  },

  // The refresh token lives in an httpOnly cookie so page scripts (and any XSS) cannot read it.
  // Same-site setups (site and API on one domain) work with the defaults. When the site and the
  // API are on different domains set COOKIE_SAMESITE=none — browsers then require HTTPS.
  cookie: {
    sameSite: ['lax', 'strict', 'none'].includes(process.env.COOKIE_SAMESITE) ? process.env.COOKIE_SAMESITE : 'lax',
    secure: process.env.COOKIE_SECURE
      ? ['1', 'true', 'yes', 'on'].includes(process.env.COOKIE_SECURE.toLowerCase())
      : process.env.NODE_ENV === 'production' || process.env.COOKIE_SAMESITE === 'none',
  },

  storage: {
    publicUrl: (process.env.PUBLIC_URL || `http://localhost:${int(process.env.PORT, 4000)}`).replace(/\/$/, ''),
    directory: process.env.UPLOAD_DIR || 'uploads',
    route: '/uploads',
  },

  uploads: {
    maxFileSizeMb: int(process.env.MAX_FILE_SIZE_MB, 12),
    imageMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    fullWidth: int(process.env.IMAGE_FULL_WIDTH, 1920),
    quality: int(process.env.IMAGE_QUALITY, 82),
  },

  rateLimit: {
    windowMinutes: int(process.env.RATE_LIMIT_WINDOW_MINUTES, 15),
    max: int(process.env.RATE_LIMIT_MAX, 300),
    loginMax: int(process.env.RATE_LIMIT_LOGIN_MAX, 10),
  },
};

/** Fails fast on misconfiguration rather than 500-ing on the first request. */
export function assertConfig() {
  const problems = [];

  if (!env.databaseUrl) problems.push('DATABASE_URL is required.');

  if (!env.jwt.secret) {
    problems.push('JWT_SECRET is required.');
  } else if (env.isProduction && env.jwt.secret.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters in production.');
  }

  if (problems.length) {
    throw new Error(`Invalid configuration:\n  - ${problems.join('\n  - ')}`);
  }
}
