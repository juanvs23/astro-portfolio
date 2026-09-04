import { z } from 'zod';

/** Social profile link with a display `name`, `href` and icon reference. */
export const SocialLinkSchema = z.object({
  id: z.string(),
  name: z.string(),
  href: z.string(),
  icon: z.string(),
  order: z.number(),
  visible: z.boolean(),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;