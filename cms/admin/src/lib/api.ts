/**
 * Fetch wrapper for the backoffice-cms API with automatic auth handling.
 *
 * - Attaches the in-memory access token as a Bearer header.
 * - On a 401 from a non-auth endpoint, refreshes the access token ONCE
 *   (single-flight — concurrent 401s share one `/auth/refresh` call), then
 *   retries the original request.
 * - If refresh fails the session is cleared and the caller sees an ApiError.
 *
 * The API base comes from `VITE_API_URL` (e.g. `https://cms-api.vercel.app`)
 * and defaults to same-origin (`/api/v1`). The `/api/v1` prefix is always
 * appended.
 */
import {
  getAccessToken,
  getStoredRefreshToken,
  persistSession,
  clearSession,
} from './tokenStore';

const RAW_BASE: string = import.meta.env.VITE_API_URL ?? '';
export const API_BASE = `${RAW_BASE.replace(/\/+$/, '')}/api/v1`;

export interface RequestOptions {
  method?: string;
  body?: unknown;
  formData?: FormData;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** In-flight refresh promise so concurrent 401s share a single rotation. */
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401, 'no_refresh_token');
  }
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearSession();
    throw new ApiError('Session expired — please log in again', 401, 'session_expired');
  }
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  persistSession(data);
  return data.accessToken;
}

/**
 * Returns a valid access token: the in-memory one if present, otherwise a
 * freshly rotated token from `/auth/refresh`. Used to silently restore a
 * session on app boot.
 */
export async function refreshSession(): Promise<string> {
  const existing = getAccessToken();
  if (existing) return existing;
  return refreshAccessToken();
}

async function rawFetch(path: string, opts: RequestOptions, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }
  return fetch(`${API_BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body,
  });
}

/**
 * Performs an API request. Non-2xx responses throw an `ApiError` carrying the
 * server `message`/`code` when present.
 */
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await rawFetch(path, opts, getAccessToken());

  // 401 on a protected endpoint → refresh once, then retry. Auth endpoints
  // are excluded to avoid an infinite refresh loop on bad credentials.
  if (res.status === 401 && !path.startsWith('/auth/')) {
    refreshing =
      refreshing ?? refreshAccessToken().finally(() => {
        refreshing = null;
      });
    const freshToken = await refreshing;
    res = await rawFetch(path, opts, freshToken);
  }

  if (!res.ok) {
    let code: string | undefined;
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string; code?: string };
      code = body.code;
      if (body.message) message = body.message;
    } catch {
      /* non-JSON error body — keep statusText */
    }
    throw new ApiError(message, res.status, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}