import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createApp } from '../app.js';
import { ProjectModel, JobModel, SiteInfoModel, NavLinkModel, SocialLinkModel } from '../models/index.js';
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

beforeAll(async () => {
  await startTestMongo();
});
afterAll(async () => {
  await stopTestMongo();
});
beforeEach(async () => {
  await clearDb();
});

async function seedFixture(): Promise<void> {
  await ProjectModel.create([
    {
      name: 'Second', url: 'https://b.dev', desc_es: 'b', desc_en: 'b',
      imageUrl: 'b', order: 2, visible: true,
    },
    {
      name: 'First', url: 'https://a.dev', desc_es: 'a', desc_en: 'a',
      imageUrl: 'a', order: 1, visible: true,
    },
    {
      name: 'Hidden', url: 'https://h.dev', desc_es: 'h', desc_en: 'h',
      imageUrl: 'h', order: 0, visible: false,
    },
  ]);
  await JobModel.create({
    title_es: 'Dev', title_en: 'Dev', company_es: 'C', company_en: 'C',
    start: '2024', end: '', description_es: 'd', description_en: 'd',
    order: 0, visible: true,
  });
  await SiteInfoModel.create({
    name: 'Juan', jobTitle: 'Web Dev', url: 'https://coltmandev.dev',
    telephone: '+58 1', logo: '/favicon.svg', brandName: 'Juan',
    twitterHandle: '@juanvs23', sameAs: ['https://github.com/juanvs23'],
  });
  await NavLinkModel.create({ key: 'menu.home', path: '/', order: 0, visible: true });
  await SocialLinkModel.create({ name: 'GitHub', href: 'https://github.com/juanvs23', icon: 'github', order: 0, visible: true });
}

describe('GET /api/v1/projects (task 2.1)', () => {
  it('returns only visible projects sorted by order ascending with _id mapped to id', async () => {
    await seedFixture();
    const res = await app.request('/api/v1/projects');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<{ name: string; id: string; visible: boolean }>;
    expect(body).toHaveLength(2);
    expect(body.map((p) => p.name)).toEqual(['First', 'Second']);
    expect(body.every((p) => p.visible === true)).toBe(true);
    expect(body[0]!.id).toMatch(/^[a-f0-9]{24}$/);
    expect(body[0]!).not.toHaveProperty('_id');
  });
});

describe('GET /api/v1/jobs (task 2.1)', () => {
  it('returns visible jobs as public Job shape', async () => {
    await seedFixture();
    const res = await app.request('/api/v1/jobs');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<{ title_es: string; id: string; end: string }>;
    expect(body).toHaveLength(1);
    expect(body[0]!.title_es).toBe('Dev');
    expect(body[0]!.end).toBe('');
    expect(body[0]!.id).toMatch(/^[a-f0-9]{24}$/);
  });
});

describe('GET /api/v1/site-info (task 2.1)', () => {
  it('returns the single site-info doc in public SiteInfo shape', async () => {
    await seedFixture();
    const res = await app.request('/api/v1/site-info');
    expect(res.status).toBe(200);
    const body = await res.json() as { name: string; jobTitle: string; sameAs: string[]; id: string };
    expect(body.name).toBe('Juan');
    expect(body.jobTitle).toBe('Web Dev');
    expect(body.sameAs).toEqual(['https://github.com/juanvs23']);
    expect(body.id).toMatch(/^[a-f0-9]{24}$/);
  });
});

describe('GET /api/v1/nav + /api/v1/social (task 2.1)', () => {
  it('returns nav links in key/path public shape', async () => {
    await seedFixture();
    const res = await app.request('/api/v1/nav');
    const body = await res.json() as Array<{ key: string; path: string; id: string }>;
    expect(body).toEqual([
      {
        key: 'menu.home', path: '/', order: 0, visible: true,
        id: expect.stringMatching(/^[a-f0-9]{24}$/),
      },
    ]);
  });

  it('returns social links in name/href/icon public shape', async () => {
    await seedFixture();
    const res = await app.request('/api/v1/social');
    const body = await res.json() as Array<{ name: string; href: string; icon: string; id: string }>;
    expect(body[0]).toMatchObject({ name: 'GitHub', href: 'https://github.com/juanvs23', icon: 'github' });
  });
});

describe('GET /api/v1/content aggregate (task 2.2)', () => {
  it('returns all collections in one ContentAggregate payload, applying visibility + order per key', async () => {
    await seedFixture();
    const res = await app.request('/api/v1/content');
    expect(res.status).toBe(200);
    const body = await res.json() as {
      projects: Array<{ name: string }>;
      jobs: unknown[];
      siteInfo: { name: string };
      nav: unknown[];
      social: unknown[];
    };
    expect(body.projects.map((p) => p.name)).toEqual(['First', 'Second']);
    expect(body.projects).toHaveLength(2); // hidden excluded
    expect(body.jobs).toHaveLength(1);
    expect(body.siteInfo.name).toBe('Juan');
    expect(body.nav).toHaveLength(1);
    expect(body.social).toHaveLength(1);
  });
});

describe('CORS on content routes (task 2.7)', () => {
  it('reflects an allowed origin on public content responses', async () => {
    await seedFixture();
    const res = await app.request('/api/v1/content', {
      headers: { Origin: 'https://allowed.dev' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('https://allowed.dev');
  });
});