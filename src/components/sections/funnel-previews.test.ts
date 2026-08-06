import { describe, it, expect } from 'vitest';
import { getTranslations } from '../../i18n';

// ---------------------------------------------------------------------------
// PR₃ (home-funnel-landing): data contracts consumed by the six copy/linkout
// preview sections (Pain, Process, Services, Projects, About, Skills). These
// components are presentational Astro templates, so the TDD unit is the i18n
// payload they render: every key must resolve non-empty in both locales and
// differ between locales, and array inputs must be well-shaped.
// ---------------------------------------------------------------------------

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface ExpressService {
  name: string;
  description: string;
}

const PREVIEW_STRING_KEYS = [
  // PainSection (section 2, Pain -> Promise)
  'funnel.pain.heading',
  'funnel.pain.description',
  'funnel.promise.heading',
  'funnel.promise.description',
  // ProcessPreviewSection (section 3)
  'funnel.process.heading',
  'funnel.process.intro',
  // ServicesPreviewSection (section 4)
  'funnel.services.heading',
  'funnel.services.description',
  'funnel.services.linkout',
  // ProjectsPreviewSection (section 7)
  'funnel.projects.heading',
  'funnel.projects.description',
  'funnel.projects.linkout',
  // AboutPreviewSection (section 6)
  'funnel.about.heading',
  'funnel.about.description',
  'funnel.about.linkout',
  // SkillsPreviewSection (section 6) — reuses about.*
  'about.skills',
  'about.skillsLink',
];

for (const key of PREVIEW_STRING_KEYS) {
  it(`preview section key ${key} resolves non-empty (es)`, async () => {
    const t = await getTranslations('es');
    const value = t(key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
    expect(value).not.toBe(key);
  });

  it(`preview section key ${key} resolves non-empty (en)`, async () => {
    const t = await getTranslations('en');
    const value = t(key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
    expect(value).not.toBe(key);
  });
}

describe('process preview data shape', () => {
  it('services.process is a 3-step sequential array (es)', async () => {
    const t = await getTranslations('es');
    const steps = t('services.process') as ProcessStep[];
    expect(Array.isArray(steps)).toBe(true);
    expect(steps).toHaveLength(3);
    expect(steps.map((s) => s.step)).toEqual([1, 2, 3]);
    for (const step of steps) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('process steps differ between locales on title (en)', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    const esSteps = tEs('services.process') as ProcessStep[];
    const enSteps = tEn('services.process') as ProcessStep[];
    expect(esSteps[0].title).not.toBe(enSteps[0].title);
  });
});

describe('services preview list shape', () => {
  it('services.express provides named services for the preview list (both locales)', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    for (const t of [tEs, tEn]) {
      const services = t('services.express') as ExpressService[];
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThanOrEqual(4);
      for (const service of services) {
        expect(service.name.length).toBeGreaterThan(0);
        expect(service.description.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('preview linkouts differ between locales', () => {
  it('localized linkout labels for services/projects/about are translated', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('funnel.services.linkout')).not.toBe(tEn('funnel.services.linkout'));
    expect(tEs('funnel.projects.linkout')).not.toBe(tEn('funnel.projects.linkout'));
    expect(tEs('funnel.about.linkout')).not.toBe(tEn('funnel.about.linkout'));
    expect(tEs('about.skillsLink')).not.toBe(tEn('about.skillsLink'));
  });
});