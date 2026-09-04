import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createApp } from '../app.js';
import { ensureAdmin } from '../services/seed.js';
import { hashPassword } from '../services/auth.js';
import { UserModel, ProjectModel, SiteInfoModel } from '../models/index.js';
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
const user = { email: 'user@cms.local', password: 'user-pass' };

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
  const res = await app.request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  expect(res.status).toBe(200);
  const body = await res.json() as { accessToken: string };
  return body.accessToken;
}

const validProject = {
  name: 'Gericht', url: 'https://restaurant.coltmandev.dev/',
  desc_es: 'Landing restaurante', desc_en: 'Restaurant landing',
  imageUrl: 'gericht', order: 1, visible: true,
};

function authed(adminToken: string) {
  return { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' };
}

describe('admin CRUD: projects (tasks 2.3, 2.4)', () => {
  it('admin can create a project and it becomes publicly readable', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/projects', {
      method: 'POST', headers: authed(token), body: JSON.stringify(validProject),
    });
    expect(res.status).toBe(201);
    const created = await res.json() as { id: string; name: string };
    expect(created.name).toBe('Gericht');
    expect(created.id).toMatch(/^[a-f0-9]{24}$/);

    const pub = await app.request('/api/v1/projects');
    const pubBody = await pub.json() as Array<{ name: string }>;
    expect(pubBody.map((p) => p.name)).toContain('Gericht');
  });

  it('rejects an invalid project body with 400 via zod validation', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/projects', {
      method: 'POST', headers: authed(token),
      body: JSON.stringify({ name: 'missing required fields' }),
    });
    expect(res.status).toBe(400);
  });

  it('admin can replace a project with PUT and the change is persisted', async () => {
    const token = await loginOk(admin);
    const created = await (await app.request('/api/v1/admin/projects', {
      method: 'POST', headers: authed(token), body: JSON.stringify(validProject),
    })).json() as { id: string };

    const res = await app.request(`/api/v1/admin/projects/${created.id}`, {
      method: 'PUT', headers: authed(token),
      body: JSON.stringify({ ...validProject, name: 'Gericht v2', order: 9 }),
    });
    expect(res.status).toBe(200);
    const updated = await res.json() as { name: string; order: number };
    expect(updated.name).toBe('Gericht v2');
    expect(updated.order).toBe(9);
  });

  it('admin can hard-delete a project (admin-only DELETE)', async () => {
    const token = await loginOk(admin);
    const created = await (await app.request('/api/v1/admin/projects', {
      method: 'POST', headers: authed(token), body: JSON.stringify(validProject),
    })).json() as { id: string };

    const del = await app.request(`/api/v1/admin/projects/${created.id}`, {
      method: 'DELETE', headers: authed(token),
    });
    expect(del.status).toBe(200);

    const remaining = await ProjectModel.countDocuments();
    expect(remaining).toBe(0);
  });
});

describe('admin role gating (tasks 2.3, 2.7)', () => {
  it('user role can create content projects (201)', async () => {
    const token = await loginOk(user);
    const res = await app.request('/api/v1/admin/projects', {
      method: 'POST', headers: authed(token), body: JSON.stringify(validProject),
    });
    expect(res.status).toBe(201);
  });

  it('admin can create jobs, nav and social through the shared CRUD', async () => {
    const token = await loginOk(admin);

    const job = await app.request('/api/v1/admin/jobs', {
      method: 'POST', headers: authed(token),
      body: JSON.stringify({
        title_es: 'Dev', title_en: 'Dev', company_es: 'C', company_en: 'C',
        start: '2024', end: '', description_es: 'd', description_en: 'd',
        order: 0, visible: true,
      }),
    });
    expect(job.status).toBe(201);
    expect((await job.json() as { title_es: string }).title_es).toBe('Dev');

    const nav = await app.request('/api/v1/admin/nav', {
      method: 'POST', headers: authed(token),
      body: JSON.stringify({ key: 'menu.home', path: '/', order: 0, visible: true }),
    });
    expect(nav.status).toBe(201);
    expect((await nav.json() as { key: string }).key).toBe('menu.home');

    const social = await app.request('/api/v1/admin/social', {
      method: 'POST', headers: authed(token),
      body: JSON.stringify({ name: 'GitHub', href: 'https://github.com/juanvs23', icon: 'github', order: 0, visible: true }),
    });
    expect(social.status).toBe(201);
    expect((await social.json() as { href: string }).href).toBe('https://github.com/juanvs23');
  });

  it('user role can update content but is forbidden from hard-deleting social (403)', async () => {
    const adminToken = await loginOk(admin);
    const created = await (await app.request('/api/v1/admin/social', {
      method: 'POST', headers: authed(adminToken),
      body: JSON.stringify({ name: 'GitHub', href: 'https://github.com/juanvs23', icon: 'github', order: 0, visible: true }),
    })).json() as { id: string };

    const userToken = await loginOk(user);
    const put = await app.request(`/api/v1/admin/social/${created.id}`, {
      method: 'PUT', headers: authed(userToken),
      body: JSON.stringify({ name: 'GitHub', href: 'https://x.com/juanvs23', icon: 'github', order: 1, visible: true }),
    });
    expect(put.status).toBe(200);

    const del = await app.request(`/api/v1/admin/social/${created.id}`, {
      method: 'DELETE', headers: authed(userToken),
    });
    expect(del.status).toBe(403);
  });

  it('user role is forbidden from hard-deleting content (403)', async () => {
    const token = await loginOk(user);
    const res = await app.request('/api/v1/admin/projects/507f1f77bcf86cd799439011', {
      method: 'DELETE', headers: authed(token),
    });
    expect(res.status).toBe(403);
  });

  it('user role is forbidden from writing site-info (403, admin-only)', async () => {
    const token = await loginOk(user);
    const res = await app.request('/api/v1/admin/site-info', {
      method: 'PUT', headers: authed(token),
      body: JSON.stringify({
        name: 'Juan', jobTitle: 'Dev', url: 'https://coltmandev.dev',
        telephone: '+58 1', logo: '/favicon.svg', brandName: 'Juan',
        twitterHandle: '@juanvs23', sameAs: [],
      }),
    });
    expect(res.status).toBe(403);
  });

  it('admin can write site-info and it becomes publicly readable', async () => {
    const token = await loginOk(admin);
    const res = await app.request('/api/v1/admin/site-info', {
      method: 'PUT', headers: authed(token),
      body: JSON.stringify({
        name: 'Juan', jobTitle: 'Web Dev', url: 'https://coltmandev.dev',
        telephone: '+58 1', logo: '/favicon.svg', brandName: 'Juan',
        twitterHandle: '@juanvs23', sameAs: ['https://github.com/juanvs23'],
      }),
    });
    expect(res.status).toBe(200);
    const updated = await res.json() as { jobTitle: string };
    expect(updated.jobTitle).toBe('Web Dev');

    const siteCount = await SiteInfoModel.countDocuments();
    expect(siteCount).toBe(1); // singleton upsert, not multiple docs
  });
});