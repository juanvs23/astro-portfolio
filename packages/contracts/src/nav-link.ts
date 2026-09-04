import { z } from 'zod';

/** Navigation link entry with a stable i18n `key` and target `path`. */
export const NavLinkSchema = z.object({
  id: z.string(),
  key: z.string(),
  path: z.string(),
  order: z.number(),
  visible: z.boolean(),
});

export type NavLink = z.infer<typeof NavLinkSchema>;