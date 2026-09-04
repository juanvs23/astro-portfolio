/**
 * Session token store for the admin SPA.
 *
 * The access token is short-lived (15 min) and kept ONLY in module memory —
 * never persisted. The refresh token is persisted in localStorage so the
 * session survives a reload and can be rotated via `/auth/refresh`.
 *
 * NOTE (design deviation): the server returns tokens in the JSON body, not an
 * httpOnly cookie, so the SPA must persist the refresh token itself. Storing
 * it in localStorage exposes it to any XSS that reaches the panel. For an
 * internal admin tool this tradeoff is acceptable; a hardened deployment
 * would move refresh to an httpOnly SameSite cookie served by the API.
 */

const REFRESH_KEY = 'cms.refresh';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

/** In-memory access token — the only place it ever lives. */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getStoredRefreshToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function hasRefreshToken(): boolean {
  return getStoredRefreshToken() !== null;
}

/** Stores an issued token pair: access in memory, refresh in localStorage. */
export function persistSession(pair: TokenPair): void {
  accessToken = pair.accessToken;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(REFRESH_KEY, pair.refreshToken);
  }
}

/** Clears both the in-memory access token and the persisted refresh token. */
export function clearSession(): void {
  accessToken = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(REFRESH_KEY);
  }
}

/**
 * Decodes the payload of a jose HS256 access JWT (base64url) to derive the
 * session user for routing guards. Returns null for any malformed token.
 */
export function decodeAccessToken(token: string): SessionUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64)) as {
      sub?: string;
      email?: string;
      role?: string;
    };
    if (!payload.sub || !payload.email || !payload.role) return null;
    if (payload.role !== 'admin' && payload.role !== 'user') return null;
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}