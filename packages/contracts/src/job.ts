import { z } from 'zod';

/**
 * Public job/work-experience resource with bilingual es/en fields.
 * `end` is a string (an empty string denotes a still-current role),
 * matching the existing portfolio `JobItem.end` convention.
 */
export const JobSchema = z.object({
  id: z.string(),
  title_es: z.string(),
  title_en: z.string(),
  company_es: z.string(),
  company_en: z.string(),
  start: z.string(),
  end: z.string(),
  description_es: z.string(),
  description_en: z.string(),
  order: z.number(),
  visible: z.boolean(),
});

export type Job = z.infer<typeof JobSchema>;