import { z } from 'zod';

/**
 * Single person/business identity document. Mirrors the existing
 * `src/constants/site-info.ts` shape so the CMS can become the source
 * of truth and the constant becomes the fallback.
 */
export const SiteInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  jobTitle: z.string(),
  url: z.string(),
  telephone: z.string(),
  logo: z.string(),
  brandName: z.string(),
  twitterHandle: z.string(),
  sameAs: z.array(z.string()),
});

export type SiteInfo = z.infer<typeof SiteInfoSchema>;