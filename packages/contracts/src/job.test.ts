import { describe, it, expect, expectTypeOf } from 'vitest';
import { JobSchema, type Job } from './job.js';

const validJob = {
  id: 'job_01',
  title_es: 'Desarrollador Web',
  title_en: 'Web Developer',
  company_es: 'Agencia X',
  company_en: 'Agency X',
  start: '2022-01',
  end: '2024-06',
  description_es: 'Desarrollo de sitios.',
  description_en: 'Building websites.',
  order: 0,
  visible: true,
} as const;

describe('JobSchema', () => {
  it('parses a valid job and preserves both locales', () => {
    const result = JobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title_es).toBe('Desarrollador Web');
      expect(result.data.title_en).toBe('Web Developer');
      expect(result.data.description_es).toBe('Desarrollo de sitios.');
      expect(result.data.description_en).toBe('Building websites.');
    }
  });

  it('rejects a job missing company_en (bilingual field required)', () => {
    const { company_en: _dropped, ...missing } = validJob;
    const result = JobSchema.safeParse(missing);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('company_en');
    }
  });

  it('rejects a job with a non-string end', () => {
    const result = JobSchema.safeParse({ ...validJob, end: 2024 });
    expect(result.success).toBe(false);
  });

  it('rejects a job with a string order instead of a number', () => {
    const result = JobSchema.safeParse({ ...validJob, order: 'first' });
    expect(result.success).toBe(false);
  });

  it('infers a Job type equal to the parsed output', () => {
    const parsed = JobSchema.parse(validJob);
    expectTypeOf(parsed).toEqualTypeOf<Job>();
    expect(parsed.visible).toBe(true);
  });
});