import { z } from 'zod';
import { ProjectSchema } from './project.js';
import { JobSchema } from './job.js';
import { SiteInfoSchema } from './site-info.js';
import { NavLinkSchema } from './nav-link.js';
import { SocialLinkSchema } from './social-link.js';

/**
 * Aggregate payload returned by `GET /api/v1/content`. Each key applies
 * the same visibility + ordering rules as the individual endpoints.
 */
export const ContentAggregateSchema = z.object({
  projects: z.array(ProjectSchema),
  jobs: z.array(JobSchema),
  siteInfo: SiteInfoSchema,
  nav: z.array(NavLinkSchema),
  social: z.array(SocialLinkSchema),
});

export type ContentAggregate = z.infer<typeof ContentAggregateSchema>;