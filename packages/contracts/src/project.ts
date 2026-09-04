import { z } from 'zod';

/**
 * Public project resource shared by server, admin and portfolio.
 * `id` maps from the Mongo `_id` string; bilingual es/en fields are
 * returned together so each client selects the locale it needs.
 */
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  desc_es: z.string(),
  desc_en: z.string(),
  imageUrl: z.string(),
  order: z.number(),
  visible: z.boolean(),
});

export type Project = z.infer<typeof ProjectSchema>;