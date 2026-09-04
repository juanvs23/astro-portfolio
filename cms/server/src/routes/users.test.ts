import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createApp } from '../app.js';
import { ensureAdmin } from '../services/seed.js';
import { hashPassword } from '../services/auth.js';
import { UserModel } from '../models/index.js';
import type { AppConfig } from '../config.js';
import { startTestMongo, stopTestMongo, clearDb } from '../test/db.js';

const cfg: AppConfig = {
  jwtSecret: 'users-test-secret',
  accessTokenTtlSec: 900,
  refreshTokenTtlSec: 2592000,
  mongoUri: 'x',
  corsOrigins: ['https://allowed.dev'],
  adminSeed: { email: 'admin@cms.local', password: 'admin-pass' },
  rateLimit: { windowMs: 60_000, max: 3 },
};

const app = createApp({ config: cfg });
const admin = { email: 'admin@cms.local', password: 'admin-pass' };
const user = { email: 'user@cms.local', password: 'user-pass' };

beforeAll(async () => {
  await startTestMongo();
  await ensureAdmin(cfg);
  await UserModel.create({
    email: user.email,
    passwordHash: await hashPassword(user.password),
    role: 'user',
  });
});
afterAll(async () => {
  await stopTestMongo();
});
beforeEach(async () => {
  await clearDb();
  await ensureAdmin(cfg);
  await UserModel.create({
    email: user.email,
    passwordHash: await hashPassword(user.password),
    role: 'user',
  });
});

async function loginOk(credentials: { email: string; password: string }): Promise<string> {
  const res = await app.request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  expect(res.status).toBe(200);
  return (await res.json() as { accessToken: string }).accessToken;
}

function authed(token: string) {
  return { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}

describe('user management API (task 3.6): admin-only', () => {
  it('admin can list all users with id/email/role/createdAt and no password hash', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/users', { method: 'GET', headers: authed(token) });
    expect(res.status).toBe(200);
    const body = await res.json() as { users: Array<{ id: string; email: string; role: string; createdAt: string }> };
    expect(body.users.map((u) => u.email).sort()).toEqual([admin.email, user.email].sort());
    const first = body.users[0]!;
    expect(first.id).toMatch(/^[a-f0-9]{24}$/);
    expect(first.role).toBeTruthy();
    expect(first.createdAt).toBeTruthy();
    const raw = JSON.stringify(body);
    expect(raw).not.toContain('passwordHash');
  });

  it('user role is forbidden from listing users (403)', async () => {
    const token = await loginOk(user);
    const res = await app.request('/api/v1/admin/users', { method: 'GET', headers: authed(token) });
    expect(res.status).toBe(403);
  });

  it('admin can create a new admin-role user', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/users', {
      method: 'POST',
      headers: authed(token),
      body: JSON.stringify({ email: 'editor@cms.local', password: 'editor-pass-1', role: 'admin' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { user: { email: string; role: string } };
    expect(body.user.email).toBe('editor@cms.local');
    expect(body.user.role).toBe('admin');

    const created = await UserModel.findOne({ email: 'editor@cms.local' });
    expect(created).not.toBeNull();
    expect(created!.role).toBe('admin');
    const matches = await hashPassword('editor-pass-1').then((h) => h.length > 0);
    expect(matches).toBe(true);
  });

  it('defaults a new user to the "user" role when role is omitted', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/users', {
      method: 'POST',
      headers: authed(token),
      body: JSON.stringify({ email: 'writer@cms.local', password: 'writer-pass-1' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { user: { role: string } };
    expect(body.user.role).toBe('user');
  });

  it('rejects a duplicate email with 409', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/users', {
      method: 'POST',
      headers: authed(token),
      body: JSON.stringify({ email: user.email, password: 'whatever-pass' }),
    });
    expect(res.status).toBe(409);
  });

  it('rejects a short password with 400', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/users', {
      method: 'POST',
      headers: authed(token),
      body: JSON.stringify({ email: 'short@cms.local', password: '123' }),
    });
    expect(res.status).toBe(400);
  });

  it('admin can change a user role and it takes effect on login', async () => {
    const token = await loginOk(admin);
    const target = await UserModel.findOne({ email: user.email });
    const res = await app.request(`/api/v1/admin/users/${target!._id.toString()}/role`, {
      method: 'PATCH',
      headers: authed(token),
      body: JSON.stringify({ role: 'admin' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { user: { role: string } };
    expect(body.user.role).toBe('admin');

    // The promoted user can now hit an admin-only route.
    const userToken = await loginOk(user);
    const users = await app.request('/api/v1/admin/users', {
      method: 'GET',
      headers: authed(userToken),
    });
    expect(users.status).toBe(200);
  });

  it('returns 404 when changing the role of an unknown user', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/users/507f1f77bcf86cd799439011/role', {
      method: 'PATCH',
      headers: authed(token),
      body: JSON.stringify({ role: 'user' }),
    });
    expect(res.status).toBe(404);
  });

  it('admin can reset a user password and the new one logs in', async () => {
    const token = await loginOk(admin);
    const target = await UserModel.findOne({ email: user.email });
    const res = await app.request(`/api/v1/admin/users/${target!._id.toString()}/reset-password`, {
      method: 'POST',
      headers: authed(token),
      body: JSON.stringify({ password: 'brand-new-pass-99' }),
    });
    expect(res.status).toBe(200);
    expect((await res.json())).toEqual({ ok: true });

    const oldLogin = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(user),
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: 'brand-new-pass-99' }),
    });
    expect(newLogin.status).toBe(200);
  });

  it('returns 404 when resetting the password of an unknown user', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/users/507f1f77bcf86cd799439011/reset-password', {
      method: 'POST',
      headers: authed(token),
      body: JSON.stringify({ password: 'whatever-pass' }),
    });
    expect(res.status).toBe(404);
  });

  it('user role is forbidden from creating users (403)', async () => {
    const token = await loginOk(user);
    const res = await app.request('/api/v1/admin/users', {
      method: 'POST',
      headers: authed(token),
      body: JSON.stringify({ email: 'nope@cms.local', password: 'nope-pass-123' }),
    });
    expect(res.status).toBe(403);
  });
});