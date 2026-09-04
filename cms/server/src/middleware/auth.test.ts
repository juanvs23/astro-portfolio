import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { requireAuth, requireRole, extractBearerToken, type Variables } from './auth.js';
import { errorHandler } from './error.js';
import { signAccessToken } from '../services/auth.js';

const SECRET = 'mw-test-secret';

async function adminToken(): Promise<string> {
  return signAccessToken(SECRET, { sub: 'u-admin', email: 'admin@cms.local', role: 'admin' }, 900);
}
async function userToken(): Promise<string> {
  return signAccessToken(SECRET, { sub: 'u-user', email: 'user@cms.local', role: 'user' }, 900);
}

function buildApp(): Hono<{ Variables: Variables }> {
  const app = new Hono<{ Variables: Variables }>();
  app.onError(errorHandler);
  app.use('/secure/*', requireAuth(SECRET));
  app.get('/secure/me', (c) => {
    const user = c.get('user');
    return c.json({ email: user.email, role: user.role });
  });
  app.get('/secure/admin', requireRole('admin'), (c) => c.json({ ok: true }));
  app.get('/secure/anyrole', requireRole('admin', 'user'), (c) => c.json({ ok: true }));
  return app;
}

describe('extractBearerToken (task 1.5, pure)', () => {
  it('parses a valid Bearer header', () => {
    expect(extractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('returns null for missing or malformed headers', () => {
    expect(extractBearerToken(undefined)).toBeNull();
    expect(extractBearerToken('Basic abc')).toBeNull();
    expect(extractBearerToken('Bearer')).toBeNull();
    expect(extractBearerToken('Bearer ')).toBeNull();
  });
});

describe('requireAuth (task 1.5)', () => {
  it('rejects a request with no Authorization header (401)', async () => {
    const res = await buildApp().request('/secure/me');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed Authorization header (401)', async () => {
    const res = await buildApp().request('/secure/me', { headers: { authorization: 'Basic xyz' } });
    expect(res.status).toBe(401);
  });

  it('rejects an invalid/forged token (401)', async () => {
    const res = await buildApp().request('/secure/me', { headers: { authorization: 'Bearer not-a-jwt' } });
    expect(res.status).toBe(401);
  });

  it('accepts a valid access token and exposes the user', async () => {
    const token = await adminToken();
    const res = await buildApp().request('/secure/me', { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'admin@cms.local', role: 'admin' });
  });
});

describe('requireRole (task 1.5)', () => {
  it('allows an admin on an admin-only route', async () => {
    const token = await adminToken();
    const res = await buildApp().request('/secure/admin', { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
  });

  it('forbids a user on an admin-only route (403)', async () => {
    const token = await userToken();
    const res = await buildApp().request('/secure/admin', { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(403);
  });

  it('allows a user when the role list includes user', async () => {
    const token = await userToken();
    const res = await buildApp().request('/secure/anyrole', { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
  });

  it('rejects with 401 when no user is attached', async () => {
    const res = await buildApp().request('/secure/admin', { headers: { authorization: 'Bearer not-a-jwt' } });
    expect(res.status).toBe(401);
  });
});