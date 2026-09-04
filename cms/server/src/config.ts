export interface AppConfig {
  jwtSecret: string;
  /** Access token lifetime in seconds (default 15 min). */
  accessTokenTtlSec: number;
  /** Refresh token lifetime in seconds (default 30 days). */
  refreshTokenTtlSec: number;
  mongoUri: string;
  /** Strict CORS allow-list. Empty means no cross-origin origin is allowed. */
  corsOrigins: string[];
  /** Credentials used to seed the initial admin user on first boot. */
  adminSeed: { email: string; password: string };
  /** Login rate-limit: max attempts per window per email+IP. */
  rateLimit: { windowMs: number; max: number };
  /** Vercel Blob write token; absent means the upload route returns 503. */
  blobToken?: string;
}

const ACCESS_TTL_SEC = 15 * 60; // 15 minutes
const REFRESH_TTL_SEC = 30 * 24 * 60 * 60; // 30 days
const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/cms';
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_MAX = 10;

/**
 * Splits a comma-separated CORS origin list into a trimmed, de-duplicated
 * allow-list. Blank entries are dropped. Pure — no env access.
 */
export function parseCors(raw?: string): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
}

/**
 * Loads the runtime configuration from the environment.
 * Throws when `JWT_SECRET` is absent — the app must never boot with a weak
 * or default signing key.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required — refusing to boot without a signing secret');
  }

  return {
    jwtSecret,
    accessTokenTtlSec: ACCESS_TTL_SEC,
    refreshTokenTtlSec: REFRESH_TTL_SEC,
    mongoUri: env.MONGO_URI ?? DEFAULT_MONGO_URI,
    corsOrigins: parseCors(env.CORS_ORIGINS),
    adminSeed: {
      email: env.ADMIN_EMAIL ?? 'admin@cms.local',
      password: env.ADMIN_PASSWORD ?? 'change-me-now',
    },
    rateLimit: {
      windowMs: RATE_WINDOW_MS,
      max: RATE_MAX,
    },
    blobToken: env.BLOB_READ_WRITE_TOKEN || undefined,
  };
}