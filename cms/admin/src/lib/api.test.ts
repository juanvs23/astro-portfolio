import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, ApiError } from './api';
import { setAccessToken, persistSession, getStoredRefreshToken } from './tokenStore';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  localStorage.clear();
  setAccessToken(null);
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api client + interceptor (task 3.2)', () => {
  it('attaches the Bearer access token and returns parsed JSON', async () => {
    setAccessToken('acc-1');
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({ authorization: 'Bearer acc-1' });
      return jsonResponse(200, { name: 'Gericht' });
    });
    vi.stubGlobal('fetch', fetchMock);

    const data = await api<{ name: string }>('/admin/projects');
    expect(data.name).toBe('Gericht');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/admin/projects'), expect.anything());
  });

  it('POSTs JSON bodies with the content-type header', async () => {
    setAccessToken('acc-1');
    const fetchMock = vi.fn(async () => jsonResponse(201, { id: 'x' }));
    vi.stubGlobal('fetch', fetchMock);

    await api('/admin/projects', { method: 'POST', body: { name: 'X' } });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ 'content-type': 'application/json' });
    expect(JSON.parse(String(init.body))).toEqual({ name: 'X' });
  });

  it('on 401 refreshes the access token once and retries the original request', async () => {
    persistSession({ accessToken: 'stale', refreshToken: 'refresh-1' });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' })) // original GET fails
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'fresh', refreshToken: 'refresh-2' })) // /auth/refresh
      .mockResolvedValueOnce(jsonResponse(200, { name: 'Gericht' })); // retried GET

    vi.stubGlobal('fetch', fetchMock);
    const data = await api<{ name: string }>('/admin/projects');

    expect(data.name).toBe('Gericht');
    // refresh endpoint called with the stored refresh token
    const refreshCall = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(refreshCall[0]).toContain('/auth/refresh');
    expect(JSON.parse(String(refreshCall[1]?.body))).toEqual({ refreshToken: 'refresh-1' });
    // new access token persisted in memory
    // (fetchMock returns a fresh token to the auth/refresh call)
  });

  it('refreshes only ONCE when two requests 401 concurrently (single-flight)', async () => {
    persistSession({ accessToken: 'stale', refreshToken: 'refresh-1' });
    let refreshCount = 0;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/auth/refresh')) {
        refreshCount += 1;
        return jsonResponse(200, { accessToken: `fresh-${refreshCount}`, refreshToken: 'refresh-2' });
      }
      const headers = (init?.headers as Record<string, string>) ?? {};
      return headers.authorization === 'Bearer stale'
        ? jsonResponse(401, { message: 'expired' })
        : jsonResponse(200, { ok: true });
    });
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([
      api('/admin/projects'),
      api('/admin/jobs'),
    ]);
    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    expect(refreshCount).toBe(1);
  });

  it('clears the session and throws ApiError when refresh fails', async () => {
    persistSession({ accessToken: 'stale', refreshToken: 'refresh-1' });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'session expired', code: 'session_expired' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api('/admin/projects')).rejects.toMatchObject({ status: 401 });
    expect(getStoredRefreshToken()).toBeNull();
  });

  it('throws ApiError with the server message and code on a non-401 error', async () => {
    setAccessToken('acc-1');
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(403, { message: 'Insufficient role', code: 'forbidden' })));
    const err = await api('/admin/users').catch((e: unknown) => e) as ApiError;
    expect(err.status).toBe(403);
    expect(err.message).toBe('Insufficient role');
    expect(err.code).toBe('forbidden');
  });

  it('does NOT auto-refresh on 401 from auth endpoints (avoids loops)', async () => {
    setAccessToken('acc-1');
    const fetchMock = vi.fn(async () => jsonResponse(401, { message: 'bad' }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api('/auth/login', { method: 'POST', body: { email: 'a', password: 'b' } }))
      .rejects.toMatchObject({ status: 401 });
    // Only one fetch — the auth endpoint itself, no refresh retry.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});