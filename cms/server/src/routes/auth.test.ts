import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createApp } from '../app.js';
import { ensureAdmin } from '../services/seed.js';
import { sha256 } from '../services/auth.js';
import { RefreshTokenModel } from '../models/refresh-token.js';
import type { AppConfig } from '../config.js';
import { startTestMongo, stopTestMongo, clearDb } from '../test/db.js';

const cfg: AppConfig = {
  jwtSecret: 'integration-test-secret',
  accessTokenTtlSec: 900,
  refreshTokenTtlSec: 2592000,
  mongoUri: 'x',
  corsOrigins: ['https://allowed.dev'],
  adminSeed: { email: 'admin@cms.local', password: 'admin-pass' },
  rateLimit: { windowMs: 60_000, max: 3 },
};

const app = createApp({ config: cfg });
const admin = { email: 'admin@cms.local', password: 'admin-pass' };

beforeAll(async () => {
  await startTestMongo();
  await ensureAdmin(cfg);
});
afterAll(async () => {
  await stopTestMongo();
});
beforeEach(async () => {
  await clearDb();
  await ensureAdmin(cfg);
});

async function login(
  email: string,
  password: string,
): Promise<Response> {
  return app.request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

async function loginOk() {
  const res = await login(admin.email, admin.password);
  expect(res.status).toBe(200);
  const body = await res.json() as { accessToken: string; refreshToken: string };
  return body;
}

describe('POST /api/v1/auth/login (task 1.7/1.8)', () => {
  it('returns an access + refresh pair for valid credentials', async () => {
    const res = await login(admin.email, admin.password);
    expect(res.status).toBe(200);
    const body = await res.json() as { accessToken: string; refreshToken: string };
    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
  });

  it('rejects a wrong password with 401', async () => {
    const res = await login(admin.email, 'wrong-pass');
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email with 401 (no enumeration)', async () => {
    const res = await login('nobody@cms.local', 'whatever');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed email with 400 via zod validator', async () => {
    const res = await login('not-an-email', 'pass');
    expect(res.status).toBe(400);
  });

  it('returns 429 once the email+IP bucket is exhausted', async () => {
    const rateApp = createApp({ config: cfg });
    for (let i = 0; i < 3; i += 1) {
      await rateApp.request('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: admin.email, password: 'wrong' }),
      });
    }
    const res = await rateApp.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'wrong' }),
    });
    expect(res.status).toBe(429);
  });
});

describe('POST /api/v1/auth/refresh (task 1.7/1.8)', () => {
  it('rotates the refresh token and returns a new pair in the same family', async () => {
    const first = await loginOk();
    const res = await app.request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: first.refreshToken }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { accessToken: string; refreshToken: string };
    expect(body.refreshToken).not.toBe(first.refreshToken);

    const oldDoc = await RefreshTokenModel.findOne({ tokenHash: sha256(first.refreshToken) });
    expect(oldDoc!.used).toBe(true);
  });

  it('revokes the family when an already-used token is replayed', async () => {
    const first = await loginOk();
    await app.request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: first.refreshToken }),
    });
    // Replaying the now-used token must fail.
    const replay = await app.request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: first.refreshToken }),
    });
    expect(replay.status).toBe(401);
  });

  it('rejects an unknown refresh token with 401', async () => {
    const res = await app.request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'definitely-not-a-token' }),
    });
    expect(res.status).toBe(401);
  });

  it('rejects a missing refreshToken body with 400', async () => {
    const res = await app.request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/logout (task 1.7/1.8)', () => {
  it('revokes the presented refresh token so refresh then fails', async () => {
    const first = await loginOk();
    const logout = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: first.refreshToken }),
    });
    expect(logout.status).toBe(200);

    const after = await app.request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: first.refreshToken }),
    });
    expect(after.status).toBe(401);
  });

  it('is idempotent for an unknown token (still 200)', async () => {
    const res = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'nope' }),
    });
    expect(res.status).toBe(200);
  });
});