import type { Context, MiddlewareHandler } from 'hono';
import type { Role } from '@cms/contracts';
import { verifyAccessToken, type AuthUserContext } from '../services/auth.js';
import { forbidden, unauthorized } from '../errors.js';

export interface Variables {
  user: AuthUserContext;
}

/** Pure: extracts the raw token from an `Authorization: Bearer <token>` header. */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const [scheme, token, ...rest] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token || rest.length > 0) return null;
  return token;
}

/** Validates the bearer token against the JWT secret and returns the user. */
export async function authenticateRequest(
  secret: string,
  authHeader: string | undefined,
): Promise<AuthUserContext> {
  const token = extractBearerToken(authHeader);
  if (!token) throw unauthorized('Missing or malformed Authorization header');
  try {
    const claims = await verifyAccessToken(secret, token);
    return { userId: claims.sub, email: claims.email, role: claims.role };
  } catch {
    throw unauthorized('Invalid or expired access token');
  }
}

/** Hono middleware: enforces a valid Bearer access token. */
export function requireAuth(secret: string): MiddlewareHandler<{ Variables: Variables }> {
  return async (c, next) => {
    const user = await authenticateRequest(secret, c.req.header('authorization'));
    c.set('user', user);
    await next();
  };
}

/**
 * Hono middleware factory: restricts a route to the given roles.
 * Runs after `requireAuth` so `c.get('user')` is populated.
 */
export function requireRole(...roles: Role[]): MiddlewareHandler<{ Variables: Variables }> {
  return async (c, next) => {
    const user = c.get('user');
    if (!user) throw unauthorized('Authentication required');
    if (!roles.includes(user.role)) {
      throw forbidden('Insufficient role for this operation');
    }
    await next();
  };
}

/** Typed accessor for `c.get('user')`. */
export function currentUser(c: Context<{ Variables: Variables }>): AuthUserContext {
  return c.get('user');
}