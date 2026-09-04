import { Hono } from 'hono';
import {
  ProjectSchema,
  JobSchema,
  SiteInfoSchema,
  NavLinkSchema,
  SocialLinkSchema,
  ContentAggregateSchema,
} from '@cms/contracts';
import {
  ProjectModel,
  JobModel,
  SiteInfoModel,
  NavLinkModel,
  SocialLinkModel,
} from '../models/index.js';
import {
  toPublicProject,
  toPublicJob,
  toPublicSiteInfo,
  toPublicNavLink,
  toPublicSocialLink,
} from '../services/transform.js';

/**
 * Public read-only content API mounted at `/api/v1`. Each collection returns
 * only visible docs (`visible !== false`), sorted by `order` ascending, with
 * the Mongo `_id` mapped to a public `id` and the payload validated against
 * the shared @cms/contracts schemas.
 */
export function publicRoutes(): Hono {
  const publicApi = new Hono();

  publicApi.get('/projects', async (c) => {
    const docs = await ProjectModel.find({ visible: true }).sort({ order: 1 }).lean();
    const payload = docs.map((d) => toPublicProject(d));
    return c.json(ProjectSchema.array().parse(payload));
  });

  publicApi.get('/jobs', async (c) => {
    const docs = await JobModel.find({ visible: true }).sort({ order: 1 }).lean();
    const payload = docs.map((d) => toPublicJob(d));
    return c.json(JobSchema.array().parse(payload));
  });

  publicApi.get('/site-info', async (c) => {
    const doc = await SiteInfoModel.findOne().sort({ _id: 1 }).lean();
    const payload = doc ? toPublicSiteInfo(doc) : null;
    return c.json(payload);
  });

  publicApi.get('/nav', async (c) => {
    const docs = await NavLinkModel.find({ visible: true }).sort({ order: 1 }).lean();
    const payload = docs.map((d) => toPublicNavLink(d));
    return c.json(NavLinkSchema.array().parse(payload));
  });

  publicApi.get('/social', async (c) => {
    const docs = await SocialLinkModel.find({ visible: true }).sort({ order: 1 }).lean();
    const payload = docs.map((d) => toPublicSocialLink(d));
    return c.json(SocialLinkSchema.array().parse(payload));
  });

  publicApi.get('/content', async (c) => {
    const [projects, jobs, siteInfo, nav, social] = await Promise.all([
      ProjectModel.find({ visible: true }).sort({ order: 1 }).lean(),
      JobModel.find({ visible: true }).sort({ order: 1 }).lean(),
      SiteInfoModel.findOne().sort({ _id: 1 }).lean(),
      NavLinkModel.find({ visible: true }).sort({ order: 1 }).lean(),
      SocialLinkModel.find({ visible: true }).sort({ order: 1 }).lean(),
    ]);

    const payload = ContentAggregateSchema.parse({
      projects: projects.map((d) => toPublicProject(d)),
      jobs: jobs.map((d) => toPublicJob(d)),
      siteInfo: siteInfo ? toPublicSiteInfo(siteInfo) : {
        id: '', name: '', jobTitle: '', url: '', telephone: '',
        logo: '', brandName: '', twitterHandle: '', sameAs: [],
      },
      nav: nav.map((d) => toPublicNavLink(d)),
      social: social.map((d) => toPublicSocialLink(d)),
    });

    return c.json(payload);
  });

  return publicApi;
}