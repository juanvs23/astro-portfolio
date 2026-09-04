import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { type ZodType } from 'zod';
import type { Model } from 'mongoose';
import {
  ProjectSchema,
  JobSchema,
  SiteInfoSchema,
  NavLinkSchema,
  SocialLinkSchema,
  type Role,
} from '@cms/contracts';
import type { AppConfig } from '../config.js';
import { requireAuth, requireRole, type Variables } from '../middleware/auth.js';
import { notFound } from '../errors.js';
import {
  ProjectModel,
  JobModel,
  SiteInfoModel,
  NavLinkModel,
  SocialLinkModel,
} from '../models/index.js';
import { usersRoutes } from './users.js';
import {
  toPublicProject,
  toPublicJob,
  toPublicSiteInfo,
  toPublicNavLink,
  toPublicSocialLink,
} from '../services/transform.js';

type AdminEnv = { Variables: Variables };

/**
 * Write-input schemas: the public contract shapes minus `id` (the Mongo `_id`
 * is assigned server-side). `@hono/zod-validator` turns any violation into a
 * 400 response (task 2.4).
 */
const ProjectWrite = ProjectSchema.omit({ id: true });
const JobWrite = JobSchema.omit({ id: true });
const NavWrite = NavLinkSchema.omit({ id: true });
const SocialWrite = SocialLinkSchema.omit({ id: true });
const SiteInfoWrite = SiteInfoSchema.omit({ id: true });

interface CrudOptions<S extends ZodType, D> {
  model: Model<D>;
  write: S;
  /** Bridge to the strongly-typed `toPublic*` transforms (they own the shape). */
  toPublic: (doc: any) => unknown;
}

/**
 * Builds the shared content CRUD pattern used by projects, jobs, nav and
 * social: `user` and `admin` may create/update; only `admin` may hard-delete.
 */
function contentCrud<S extends ZodType, D>(
  opts: CrudOptions<S, D>,
  writeRoles: Role[],
): Hono<AdminEnv> {
  const r = new Hono<AdminEnv>();

  // Admin list: returns ALL docs (visible and invisible) so editors can
  // re-enable hidden items. Unlike the public routes, no `visible` filter.
  r.get('/', requireRole(...writeRoles), async (c) => {
    const docs = await opts.model.find({}).sort({ order: 1 }).lean();
    return c.json(docs.map((d) => opts.toPublic(d)));
  });

  r.post('/', requireRole(...writeRoles), zValidator('json', opts.write), async (c) => {
    const doc = await opts.model.create(c.req.valid('json'));
    return c.json(opts.toPublic(doc), 201);
  });

  r.put('/:id', requireRole(...writeRoles), zValidator('json', opts.write), async (c) => {
    const doc = await opts.model.findByIdAndUpdate(
      c.req.param('id'),
      c.req.valid('json'),
      { new: true, runValidators: true },
    );
    if (!doc) throw notFound('Resource not found');
    return c.json(opts.toPublic(doc));
  });

  r.delete('/:id', requireRole('admin'), async (c) => {
    const doc = await opts.model.findByIdAndDelete(c.req.param('id'));
    if (!doc) throw notFound('Resource not found');
    return c.json({ ok: true });
  });

  return r;
}

/**
 * Admin write API mounted at `/api/v1/admin`. Every route requires a valid
 * Bearer token (`requireAuth`); content writes are `user`+`admin`, while
 * site-info writes and hard-deletes are `admin`-only.
 */
export function adminRoutes(cfg: AppConfig): Hono<AdminEnv> {
  const admin = new Hono<AdminEnv>();
  admin.use('*', requireAuth(cfg.jwtSecret));

  admin.route('/projects', contentCrud(
    { model: ProjectModel, write: ProjectWrite, toPublic: toPublicProject },
    ['admin', 'user'],
  ));
  admin.route('/jobs', contentCrud(
    { model: JobModel, write: JobWrite, toPublic: toPublicJob },
    ['admin', 'user'],
  ));
  admin.route('/nav', contentCrud(
    { model: NavLinkModel, write: NavWrite, toPublic: toPublicNavLink },
    ['admin', 'user'],
  ));
  admin.route('/social', contentCrud(
    { model: SocialLinkModel, write: SocialWrite, toPublic: toPublicSocialLink },
    ['admin', 'user'],
  ));

  // site-info is a single document: PUT upserts it (admin-only).
  admin.put('/site-info', requireRole('admin'), zValidator('json', SiteInfoWrite), async (c) => {
    const doc = await SiteInfoModel.findOneAndUpdate(
      {},
      c.req.valid('json'),
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );
    return c.json(toPublicSiteInfo(doc!));
  });

  // Admin read of the current site-info singleton (admin-only).
  admin.get('/site-info', requireRole('admin'), async (c) => {
    const doc = await SiteInfoModel.findOne().sort({ _id: 1 }).lean();
    return c.json(doc ? toPublicSiteInfo(doc) : null);
  });

  // User management (admin-only) — task 3.6.
  admin.route('/users', usersRoutes());

  return admin;
}