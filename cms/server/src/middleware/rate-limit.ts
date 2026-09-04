import type { Context, MiddlewareHandler } from 'hono';
import type { AppConfig } from '../config.js';
import { RateLimitModel } from '../models/rate-limit.js';
import { tooManyRequests } from '../errors.js';

/** Pure: deterministic bucket key from normalised email + client IP. */
export function rateLimitKey(email: string, ip: string): string {
  return `${email.trim().toLowerCase()}|${ip}`;
}

export interface ConsumeResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Atomically records one login attempt for a key within the current window.
 * A new Mongo doc is created per window (unique {key, resetAt}); the TTL index
 * drops it once the window expires.
 */
export async function consumeLoginAttempt(
  key: string,
  cfg: AppConfig,
): Promise<ConsumeResult> {
  const { windowMs, max } = cfg.rateLimit;
  const now = Date.now();
  const resetAt = new Date(Math.ceil(now / windowMs) * windowMs);

  const doc = await RateLimitModel.findOneAndUpdate(
    { key, resetAt },
    { $inc: { count: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const count = doc!.count;
  return { allowed: count <= max, remaining: Math.max(0, max - count) };
}

/**
 * Throws HttpError 429 when the email+IP bucket is exhausted. Call this after
 * the request body has already been parsed (route handler) to avoid consuming
 * the stream twice.
 */
export async function loginRateLimitGuard(
  email: string,
  ip: string,
  cfg: AppConfig,
): Promise<void> {
  const { allowed } = await consumeLoginAttempt(rateLimitKey(email, ip), cfg);
  if (!allowed) {
    throw tooManyRequests('Too many login attempts — try again later');
  }
}

/** Best-effort client IP from common proxies. */
export function clientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  );
}

/**
 * Hono middleware wrapping the login guard. Reads `email` from the JSON body
 * without assuming a schema (used only when the route does not pre-parse).
 */
export function loginRateLimit(cfg: AppConfig): MiddlewareHandler {
  return async (c, next) => {
    const body = (await c.req.json().catch(() => ({}))) as { email?: unknown };
    if (typeof body.email === 'string') {
      await loginRateLimitGuard(body.email, clientIp(c), cfg);
    }
    await next();
  };
}