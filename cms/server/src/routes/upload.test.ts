import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createApp } from '../app.js';
import { ensureAdmin } from '../services/seed.js';
import { hashPassword } from '../services/auth.js';
import { UserModel } from '../models/index.js';
import type { AppConfig } from '../config.js';
import { startTestMongo, stopTestMongo, clearDb } from '../test/db.js';

const cfg: AppConfig = {
  jwtSecret: 'integration-test-secret',
  accessTokenTtlSec: 900,
  refreshTokenTtlSec: 2592000,
  mongoUri: 'x',
  corsOrigins: [],
  adminSeed: { email: 'admin@cms.local', password: 'admin-pass' },
  rateLimit: { windowMs: 60_000, max: 3 },
  blobToken: 'blob-test-token',
};

const user = { email: 'user@cms.local', password: 'user-pass' };

vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (_pathname: string, _body: unknown, _opts: unknown) => ({
    url: 'https://pub-abc.vercel-blob.com/cms/123-image.jpg',
    pathname: 'cms/123-image.jpg',
  })),
}));

beforeAll(async () => {
  await startTestMongo();
  await ensureAdmin(cfg);
  await UserModel.create({ email: user.email, passwordHash: await hashPassword(user.password), role: 'user' });
});
afterAll(async () => {
  await stopTestMongo();
});
beforeEach(async () => {
  await clearDb();
  await ensureAdmin(cfg);
  await UserModel.create({ email: user.email, passwordHash: await hashPassword(user.password), role: 'user' });
});

async function loginOk(credentials: { email: string; password: string }): Promise<string> {
  const res = await createApp({ config: cfg }).request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const body = await res.json() as { accessToken: string };
  return body.accessToken;
}

function formDataWithImage(): FormData {
  const fd = new FormData();
  fd.append('file', new File(['fake-image-bytes'], 'portfolio.jpg', { type: 'image/jpeg' }));
  return fd;
}

describe('POST /api/v1/admin/upload (task 2.5)', () => {
  it('uploads an image and returns { url } when a blob token is configured', async () => {
    const { put } = await import('@vercel/blob');
    const token = await loginOk(cfg.adminSeed);
    const res = await createApp({ config: cfg }).request('/api/v1/admin/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: formDataWithImage(),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { url: string };
    expect(body.url).toMatch(/^https:\/\/pub-abc\.vercel-blob\.com\/cms\//);
    expect(put).toHaveBeenCalledTimes(1);
  });

  it('returns 503 with a clear message when no blob token is configured', async () => {
    const token = await loginOk(cfg.adminSeed);
    const noBlobApp = createApp({ config: { ...cfg, blobToken: undefined } });
    const res = await noBlobApp.request('/api/v1/admin/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: formDataWithImage(),
    });
    expect(res.status).toBe(503);
    const body = await res.json() as { error: { code: string; message: string } };
    expect(body.error.code).toBe('blob_not_configured');
    expect(body.error.message).toContain('BLOB_READ_WRITE_TOKEN');
  });

  it('returns 400 when the multipart body has no file', async () => {
    const token = await loginOk(cfg.adminSeed);
    const fd = new FormData();
    fd.append('foo', 'bar');
    const res = await createApp({ config: cfg }).request('/api/v1/admin/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: fd,
    });
    expect(res.status).toBe(400);
  });

  it('forbids the user role from uploading (403, admin-only)', async () => {
    const token = await loginOk(user);
    const res = await createApp({ config: cfg }).request('/api/v1/admin/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: formDataWithImage(),
    });
    expect(res.status).toBe(403);
  });
});