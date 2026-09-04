import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  ProjectModel, JobModel, SiteInfoModel, NavLinkModel, SocialLinkModel,
} from '../models/index.js';
import { seedContent, contentSeedData } from '../services/content-seed.js';
import { startTestMongo, stopTestMongo, clearDb } from '../test/db.js';

beforeAll(async () => {
  await startTestMongo();
});
afterAll(async () => {
  await stopTestMongo();
});
beforeEach(async () => {
  await clearDb();
});

describe('content seed (task 2.6)', () => {
  it('seeds exactly the 18 portfolio projects, 6 jobs, site-info, 4 nav and 4 social links', async () => {
    const counts = await seedContent();
    expect(counts.projects).toBe(18);
    expect(counts.jobs).toBe(6);
    expect(counts.siteInfo).toBe(1);
    expect(counts.nav).toBe(4);
    expect(counts.social).toBe(4);
  });

  it('seeds projects with imageUrl as a local slug (not a remote URL) and visible true', async () => {
    await seedContent();
    const projects = await ProjectModel.find().lean();
    expect(projects).toHaveLength(18);
    for (const p of projects) {
      expect(p.imageUrl).not.toMatch(/^https?:\/\//);
      expect(p.visible).toBe(true);
    }
    const slugs = new Set(projects.map((p) => p.imageUrl));
    expect(slugs).toContain('gericht');
    expect(slugs).toContain('luxlife');
    expect(slugs).toContain('thehillsrehab');
  });

  it('is idempotent: a second seed run does not duplicate content', async () => {
    await seedContent();
    await seedContent();
    expect(await ProjectModel.countDocuments()).toBe(18);
    expect(await JobModel.countDocuments()).toBe(6);
    expect(await SiteInfoModel.countDocuments()).toBe(1);
    expect(await NavLinkModel.countDocuments()).toBe(4);
    expect(await SocialLinkModel.countDocuments()).toBe(4);
  });

  it('provides bilingual job seed data (title_es/title_en pairs)', () => {
    const jobs = contentSeedData.jobs;
    expect(jobs).toHaveLength(6);
    for (const job of jobs) {
      expect(job.title_es.length).toBeGreaterThan(0);
      expect(job.title_en.length).toBeGreaterThan(0);
      expect(job.company_es.length).toBeGreaterThan(0);
      expect(job.company_en.length).toBeGreaterThan(0);
    }
    expect(jobs[0]!.title_en).toContain('Full Stack');
    expect(jobs[0]!.title_es).toContain('Full Stack');
  });

  it('provides a siteInfo seed with a populated sameAs list', () => {
    const si = contentSeedData.siteInfo;
    expect(si.name).toBe('Juan Carlos Ávila');
    expect(si.jobTitle).toContain('Web Developer');
    expect(si.sameAs.length).toBeGreaterThanOrEqual(4);
  });
});