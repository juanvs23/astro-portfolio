import { describe, it, expect } from 'vitest';
import { getTranslations, getFullTranslations, defaultLocale } from '../i18n';

describe('i18n', () => {
  it('should load Spanish translations', async () => {
    const t = await getTranslations('es');
    expect(t('hero.title')).toBeDefined();
    expect(typeof t('hero.title')).toBe('string');
  });

  it('should load English translations', async () => {
    const t = await getTranslations('en');
    expect(t('hero.title')).toBeDefined();
    expect(typeof t('hero.title')).toBe('string');
  });

  it('should return different translations for different locales', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('hero.title')).not.toBe(tEn('hero.title'));
  });
});

// ---------------------------------------------------------------------------
// Calculator i18n labels (Phase 2)
// ---------------------------------------------------------------------------
describe('services.calculator i18n', () => {
  const CALC_KEYS = [
    'services.calculator.heading',
    'services.calculator.subheading',
    'services.calculator.steps.scale',
    'services.calculator.steps.urgency',
    'services.calculator.steps.result',
    'services.calculator.result.estimated',
    'services.calculator.result.range',
    'services.calculator.result.disclaimer',
    'services.calculator.cta.whatsapp',
    'services.calculator.cta.recalculate',
  ];

  for (const key of CALC_KEYS) {
    it(`should resolve ${key} to a non-empty string (es)`, async () => {
      const t = await getTranslations('es');
      const value = t(key);
      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    });

    it(`should resolve ${key} to a non-empty string (en)`, async () => {
      const t = await getTranslations('en');
      const value = t(key);
      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    });
  }

  it('should differ between locales for calculator heading', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('services.calculator.heading')).not.toBe(
      tEn('services.calculator.heading'),
    );
  });
});

// ---------------------------------------------------------------------------
// Phase 3: services i18n content (tasks 3.1–3.4)
// ---------------------------------------------------------------------------

interface WebPlan {
  id: string;
  name: string;
  startingPrice: number;
  delivery: string;
  recommended: boolean;
  features: string[];
  cta: string;
}

interface ExpressService {
  name: string;
  description: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

describe('services.webPlans i18n', () => {
  it('should have 3 web plans in ES', async () => {
    const t = await getTranslations('es');
    const plans = t.object('services.webPlans') as WebPlan[];
    expect(Array.isArray(plans)).toBe(true);
    expect(plans).toHaveLength(3);
  });

  it('should have 3 web plans in EN', async () => {
    const t = await getTranslations('en');
    const plans = t.object('services.webPlans') as WebPlan[];
    expect(Array.isArray(plans)).toBe(true);
    expect(plans).toHaveLength(3);
  });

  it('should have Básico as first plan in ES', async () => {
    const t = await getTranslations('es');
    const plans = t.object('services.webPlans') as WebPlan[];
    expect(plans[0].name).toBe('Básico');
    expect(plans[0].startingPrice).toBe(120);
    expect(plans[0].delivery).toBe('3 días');
    expect(plans[0].recommended).toBe(false);
    expect(plans[0].cta.length).toBeGreaterThan(0);
    expect(plans[0].features.length).toBeGreaterThanOrEqual(3);
  });

  it('should have Profesional as the recommended plan', async () => {
    const t = await getTranslations('es');
    const plans = t.object('services.webPlans') as WebPlan[];
    expect(plans[1].name).toBe('Profesional');
    expect(plans[1].startingPrice).toBe(250);
    expect(plans[1].recommended).toBe(true);
  });

  it('should have E-commerce as third plan with price 500', async () => {
    const t = await getTranslations('en');
    const plans = t.object('services.webPlans') as WebPlan[];
    expect(plans[2].name).toBe('E-commerce');
    expect(plans[2].startingPrice).toBe(500);
    expect(plans[2].delivery).toBe('14 days');
    expect(plans[2].recommended).toBe(false);
  });

  it('web plans carry stable non-localized ids in both locales', async () => {
    for (const locale of ['es', 'en'] as const) {
      const t = await getTranslations(locale);
      const plans = t.object('services.webPlans') as WebPlan[];
      expect(plans.map((p) => p.id)).toEqual(['basic', 'professional', 'ecommerce']);
    }
  });
});

describe('services.express i18n', () => {
  it('should have 6 express services in ES', async () => {
    const t = await getTranslations('es');
    const items = t.object('services.express') as ExpressService[];
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(6);
  });

  it('should have 6 express services in EN', async () => {
    const t = await getTranslations('en');
    const items = t.object('services.express') as ExpressService[];
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(6);
  });

  it('each express item should have non-empty name and description (ES)', async () => {
    const t = await getTranslations('es');
    const items = t.object('services.express') as ExpressService[];
    for (const item of items) {
      expect(item.name).toBeDefined();
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description).toBeDefined();
      expect(item.description.length).toBeGreaterThan(0);
    }
  });
});

describe('services.process i18n', () => {
  it('should have 3 process steps in ES', async () => {
    const t = await getTranslations('es');
    const steps = t.object('services.process') as ProcessStep[];
    expect(Array.isArray(steps)).toBe(true);
    expect(steps).toHaveLength(3);
  });

  it('should have 3 process steps in EN', async () => {
    const t = await getTranslations('en');
    const steps = t.object('services.process') as ProcessStep[];
    expect(Array.isArray(steps)).toBe(true);
    expect(steps).toHaveLength(3);
  });

  it('process steps should have sequential step numbers 1, 2, 3', async () => {
    const t = await getTranslations('es');
    const steps = t.object('services.process') as ProcessStep[];
    expect(steps[0].step).toBe(1);
    expect(steps[1].step).toBe(2);
    expect(steps[2].step).toBe(3);
  });
});

describe('services.launchPricing i18n', () => {
  it('should have badge and note in ES', async () => {
    const t = await getTranslations('es');
    const lp = t.object('services.launchPricing') as Record<string, string>;
    expect(lp.badge).toBeDefined();
    expect(lp.badge.length).toBeGreaterThan(0);
    expect(lp.note).toBeDefined();
    expect(lp.note.length).toBeGreaterThan(0);
  });
});

describe('services.ia i18n', () => {
  it('should have heading and description in ES', async () => {
    const t = await getTranslations('es');
    const ia = t.object('services.ia') as Record<string, string>;
    expect(ia.heading).toBeDefined();
    expect(ia.heading.length).toBeGreaterThan(0);
    expect(ia.description).toBeDefined();
    expect(ia.description.length).toBeGreaterThan(0);
  });

  it('should have heading and description in EN', async () => {
    const t = await getTranslations('en');
    const ia = t.object('services.ia') as Record<string, string>;
    expect(ia.heading).toBeDefined();
    expect(ia.heading.length).toBeGreaterThan(0);
    expect(ia.description).toBeDefined();
    expect(ia.description.length).toBeGreaterThan(0);
  });
});

describe('services.aiNote i18n', () => {
  it('should be present in EN only', async () => {
    const tEn = await getTranslations('en');
    const note = tEn('services.aiNote');
    expect(typeof note).toBe('string');
    expect((note as string).length).toBeGreaterThan(0);

    const tEs = await getTranslations('es');
    const noteEs = tEs('services.aiNote');
    // ES returns the path itself as fallback (key not found)
    expect(noteEs).toBe('services.aiNote');
  });
});

describe('SEO services keys', () => {
  it('should have seo.pages.services in ES', async () => {
    const t = await getTranslations('es');
    const val = t('seo.pages.services');
    expect(typeof val).toBe('string');
    expect((val as string).length).toBeGreaterThan(0);
    expect(val).not.toBe('seo.pages.services');
  });

  it('should have seo.descriptions.services in EN', async () => {
    const t = await getTranslations('en');
    const val = t('seo.descriptions.services');
    expect(typeof val).toBe('string');
    expect((val as string).length).toBeGreaterThan(0);
    expect(val).not.toBe('seo.descriptions.services');
  });

  it('should have seo.h1.services in ES', async () => {
    const t = await getTranslations('es');
    const val = t('seo.h1.services');
    expect(typeof val).toBe('string');
    expect((val as string).length).toBeGreaterThan(0);
    expect(val).not.toBe('seo.h1.services');
  });
});

// ---------------------------------------------------------------------------
// PR₁ (home-funnel-landing): defaultLocale + funnel.* namespace + hero.* tuning
// ---------------------------------------------------------------------------

describe('i18n defaultLocale (PR₁)', () => {
  it('should default to es', async () => {
    expect(defaultLocale).toBe('es');
  });
});

interface FaqItem {
  question: string;
  answer: string;
}

describe('funnel.* namespace i18n (PR₁)', () => {
  const FUNNEL_STRING_KEYS = [
    'funnel.hero.cta',
    'funnel.pain.heading',
    'funnel.pain.description',
    'funnel.promise.heading',
    'funnel.promise.description',
    'funnel.process.heading',
    'funnel.process.intro',
    'funnel.services.heading',
    'funnel.services.description',
    'funnel.services.linkout',
    'funnel.proof.heading',
    'funnel.proof.benefits',
    'funnel.about.heading',
    'funnel.about.description',
    'funnel.about.linkout',
    'funnel.projects.heading',
    'funnel.projects.description',
    'funnel.projects.linkout',
    'funnel.audit.heading',
    'funnel.audit.description',
    'funnel.audit.cta',
    'funnel.audit.subject',
    'funnel.audit.message',
    'funnel.pricing.heading',
    'funnel.pricing.description',
    'funnel.pricing.cta',
    'funnel.pricing.linkout',
    'funnel.contact.heading',
    'funnel.contact.description',
    'funnel.contact.cta',
    'funnel.footer.heading',
    'funnel.footer.tagline',
  ];

  for (const key of FUNNEL_STRING_KEYS) {
    it(`should resolve ${key} to a non-empty string (es)`, async () => {
      const t = await getTranslations('es');
      const value = t(key);
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
      expect(value).not.toBe(key);
    });

    it(`should resolve ${key} to a non-empty string (en)`, async () => {
      const t = await getTranslations('en');
      const value = t(key);
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
      expect(value).not.toBe(key);
    });
  }

  it('should have 4-6 FAQ items with non-empty question/answer (es)', async () => {
    const t = await getTranslations('es');
    const faq = t.object('funnel.faq') as FaqItem[];
    expect(Array.isArray(faq)).toBe(true);
    expect(faq.length).toBeGreaterThanOrEqual(4);
    expect(faq.length).toBeLessThanOrEqual(6);
    for (const item of faq) {
      expect(item.question.length).toBeGreaterThan(0);
      expect(item.answer.length).toBeGreaterThan(0);
    }
  });

  it('should have 4-6 FAQ items with non-empty question/answer (en)', async () => {
    const t = await getTranslations('en');
    const faq = t.object('funnel.faq') as FaqItem[];
    expect(Array.isArray(faq)).toBe(true);
    expect(faq.length).toBeGreaterThanOrEqual(4);
    expect(faq.length).toBeLessThanOrEqual(6);
    for (const item of faq) {
      expect(item.question.length).toBeGreaterThan(0);
      expect(item.answer.length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty proof.metrics and proof.results arrays (es)', async () => {
    const t = await getTranslations('es');
    const metrics = t.object('funnel.proof.metrics') as string[];
    const results = t.object('funnel.proof.results') as string[];
    expect(metrics.length).toBeGreaterThanOrEqual(4);
    expect(results.length).toBeGreaterThanOrEqual(2);
    for (const m of metrics) {
      expect(m.length).toBeGreaterThan(0);
    }
    for (const r of results) {
      expect(r.length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty proof.metrics and proof.results arrays (en)', async () => {
    const t = await getTranslations('en');
    const metrics = t.object('funnel.proof.metrics') as string[];
    const results = t.object('funnel.proof.results') as string[];
    expect(metrics.length).toBeGreaterThanOrEqual(4);
    expect(results.length).toBeGreaterThanOrEqual(2);
    for (const m of metrics) {
      expect(m.length).toBeGreaterThan(0);
    }
    for (const r of results) {
      expect(r.length).toBeGreaterThan(0);
    }
  });

  it('should differ between locales for funnel.hero.cta', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('funnel.hero.cta')).not.toBe(tEn('funnel.hero.cta'));
  });

  it('should differ between locales for funnel.pricing.heading', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('funnel.pricing.heading')).not.toBe(tEn('funnel.pricing.heading'));
  });

  it('should not duplicate services.offer copy under funnel.pricing (no plan names)', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    const pricingEs = String(tEs('funnel.pricing.description'));
    const pricingEn = String(tEn('funnel.pricing.description'));
    const planNames = ['Básico', 'Profesional', 'E-commerce', 'Basic', 'Professional'];
    for (const name of planNames) {
      expect(pricingEs).not.toContain(name);
      expect(pricingEn).not.toContain(name);
    }
  });

  it('should have funnel.aiNote in EN only (es falls back to key)', async () => {
    const tEn = await getTranslations('en');
    const note = tEn('funnel.aiNote');
    expect(typeof note).toBe('string');
    expect((note as string).length).toBeGreaterThan(0);
    expect(note).not.toBe('funnel.aiNote');

    const tEs = await getTranslations('es');
    expect(tEs('funnel.aiNote')).toBe('funnel.aiNote');
  });
});

// ---------------------------------------------------------------------------
// PR₁: hero.* tuned copy + no-voseo scan on es funnel + hero values
// ---------------------------------------------------------------------------

function collectStringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringValues(item));
  }
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap((item) => collectStringValues(item));
  }
  return [];
}

describe('hero.* tuned copy i18n (PR₁)', () => {
  it('should resolve hero.badge/title/description non-empty in es', async () => {
    const t = await getTranslations('es');
    for (const key of ['hero.badge', 'hero.title', 'hero.description']) {
      const value = t(key);
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it('should resolve hero.badge/title/description non-empty in en', async () => {
    const t = await getTranslations('en');
    for (const key of ['hero.badge', 'hero.title', 'hero.description']) {
      const value = t(key);
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it('should differ between locales for hero.title and hero.description', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('hero.title')).not.toBe(tEn('hero.title'));
    expect(tEs('hero.description')).not.toBe(tEn('hero.description'));
  });

  it('should NOT contain hero.canvasLabel in es (removed with Three.js stack)', async () => {
    const t = await getTranslations('es');
    const canvasLabel = t('hero.canvasLabel');
    // key was removed — t() must fall back to returning the key itself
    expect(canvasLabel).toBe('hero.canvasLabel');
  });

  it('should NOT contain hero.canvasLabel in en (removed with Three.js stack)', async () => {
    const t = await getTranslations('en');
    const canvasLabel = t('hero.canvasLabel');
    // key was removed — t() must fall back to returning the key itself
    expect(canvasLabel).toBe('hero.canvasLabel');
  });

  it('es funnel.* + hero.* values must not contain voseo tokens', async () => {
    const VOSEO_TOKENS = [
      'Usá', 'Aprovechá', 'Contame', 'necesitás', 'recibís',
      'imaginate', 'habla', 'tenés', 'podés', 'querés', 'sabés',
    ];
    const es = await getFullTranslations('es');
    const funnelValues = collectStringValues(es.funnel);
    const heroValues = collectStringValues(es.hero);
    expect(funnelValues.length).toBeGreaterThan(0);
    expect(heroValues.length).toBeGreaterThan(0);

    const allValues = [...funnelValues, ...heroValues];
    for (const value of allValues) {
      const lower = value.toLowerCase();
      for (const token of VOSEO_TOKENS) {
        expect(lower).not.toContain(token.toLowerCase());
      }
    }
  });
});

// ---------------------------------------------------------------------------
// PR₃ (seo-complete-review / slice 3): seo.* copy intent + i18n guards
// ---------------------------------------------------------------------------

function flattenI18nKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    flattenI18nKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}

function extractNumbers(text: string): string[] {
  return text.match(/\d+/g) ?? [];
}

function collectValuesExcept(root: unknown, excludedKey: string): string[] {
  if (typeof root !== 'object' || root === null) return [];
  const rest = Object.fromEntries(
    Object.entries(root as Record<string, unknown>).filter(([k]) => k !== excludedKey),
  );
  return collectStringValues(rest);
}

describe('seo.* copy intent i18n guards (PR₃)', () => {
  interface SeoShape {
    title: string;
    description: string;
    ogImageAlt: string;
    pages: Record<string, string>;
    descriptions: Record<string, string>;
    h1: Record<string, string>;
  }
  const SEO_INTENT = {
    services: {
      es: ['precios', 'servicios de desarrollo'],
      en: ['pricing', 'web development services'],
    },
    automation: {
      es: ['chatbots', 'agentes', 'rag', 'automatización'],
      en: ['chatbots', 'agents', 'rag', 'automation'],
    },
    projects: {
      es: ['casos', 'ejemplos'],
      en: ['case stud', 'examples'],
    },
    about: {
      es: ['experiencia', 'experto', 'confianza', 'trayectoria', 'socio'],
      en: ['experience', 'expert', 'trust', 'credib', 'partner'],
    },
    contact: {
      es: ['contacta', 'hablemos', 'contacte'],
      en: ['get in touch', 'contact', "let's talk"],
    },
    home: {
      es: ['conversión', 'convierta', 'clientes', 'auditoría gratuita'],
      en: ['conversion', 'convert', 'customers', 'clients', 'free audit'],
    },
  };

  it('should keep seo key sets identical between es and en (including ogImageAlt)', async () => {
    const [es, en] = await Promise.all([getFullTranslations('es'), getFullTranslations('en')]);
    const esKeys = flattenI18nKeys(es.seo).sort();
    const enKeys = flattenI18nKeys(en.seo).sort();
    expect(esKeys.length).toBeGreaterThan(0);
    expect(esKeys).toEqual(enKeys);
    expect(esKeys).toContain('ogImageAlt');
  });

  it('every seo.* leaf value should be a non-empty string, never the raw key (es + en)', async () => {
    for (const locale of ['es', 'en'] as const) {
      const t = await getTranslations(locale);
      const full = await getFullTranslations(locale);
      const keys = flattenI18nKeys(full.seo, 'seo');
      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) {
        const value = t(key);
        expect(typeof value).toBe('string');
        expect((value as string).length).toBeGreaterThan(0);
        expect(value).not.toBe(key);
      }
    }
  });

  it('seo.ogImageAlt should be non-empty and differ from every seo description (es)', async () => {
    const es = await getFullTranslations('es');
    const alt = (es.seo as unknown as SeoShape).ogImageAlt as string;
    expect(typeof alt).toBe('string');
    expect(alt.length).toBeGreaterThan(0);
    const descriptions = collectStringValues((es.seo as unknown as SeoShape).descriptions);
    expect(descriptions.length).toBeGreaterThan(0);
    for (const description of descriptions) {
      expect(alt).not.toBe(description);
    }
  });

  it('seo.ogImageAlt should be non-empty and differ from every seo description (en)', async () => {
    const en = await getFullTranslations('en');
    const alt = (en.seo as unknown as SeoShape).ogImageAlt as string;
    expect(typeof alt).toBe('string');
    expect(alt.length).toBeGreaterThan(0);
    const descriptions = collectStringValues((en.seo as unknown as SeoShape).descriptions);
    expect(descriptions.length).toBeGreaterThan(0);
    for (const description of descriptions) {
      expect(alt).not.toBe(description);
    }
  });

  it('es seo.* values must not contain voseo tokens', async () => {
    const VOSEO_TOKENS = [
      'Usá', 'Aprovechá', 'Contame', 'necesitás', 'recibís',
      'imaginate', 'habla', 'tenés', 'podés', 'querés', 'sabés',
    ];
    const es = await getFullTranslations('es');
    const seoValues = collectStringValues(es.seo);
    expect(seoValues.length).toBeGreaterThan(0);
    for (const value of seoValues) {
      const lower = value.toLowerCase();
      for (const token of VOSEO_TOKENS) {
        expect(lower).not.toContain(token.toLowerCase());
      }
    }
  });

  it('numeric claims in seo.* must appear elsewhere in the same locale (es)', async () => {
    const es = await getFullTranslations('es');
    const seoNumbers = new Set(collectStringValues(es.seo).flatMap(extractNumbers));
    const restNumbers = new Set(collectValuesExcept(es, 'seo').flatMap(extractNumbers));
    for (const num of seoNumbers) {
      expect(restNumbers.has(num), `es seo number "${num}" must also appear outside seo.*`).toBe(true);
    }
  });

  it('numeric claims in seo.* must appear elsewhere in the same locale (en)', async () => {
    const en = await getFullTranslations('en');
    const seoNumbers = new Set(collectStringValues(en.seo).flatMap(extractNumbers));
    const restNumbers = new Set(collectValuesExcept(en, 'seo').flatMap(extractNumbers));
    for (const num of seoNumbers) {
      expect(restNumbers.has(num), `en seo number "${num}" must also appear outside seo.*`).toBe(true);
    }
  });

  it('services page carries pricing/services intent (es + en)', async () => {
    for (const locale of ['es', 'en'] as const) {
      const full = await getFullTranslations(locale);
      const combined = [
        (full.seo as unknown as SeoShape).pages.services,
        (full.seo as unknown as SeoShape).descriptions.services,
        (full.seo as unknown as SeoShape).h1.services,
      ].join(' ').toLowerCase();
      const keywords = SEO_INTENT.services[locale];
      const hit = keywords.some((k) => combined.includes(k));
      expect(hit, `${locale} services seo copy should include one of: ${keywords.join(', ')}`).toBe(true);
    }
  });

  it('automation page carries AI automation intent (es + en)', async () => {
    for (const locale of ['es', 'en'] as const) {
      const full = await getFullTranslations(locale);
      const combined = [
        (full.seo as unknown as SeoShape).pages.automation,
        (full.seo as unknown as SeoShape).descriptions.automation,
        (full.seo as unknown as SeoShape).h1.automation,
      ].join(' ').toLowerCase();
      const keywords = SEO_INTENT.automation[locale];
      const hits = keywords.filter((k) => combined.includes(k)).length;
      expect(hits, `${locale} automation seo copy should include at least 2 of: ${keywords.join(', ')}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('projects page carries case-study intent (es + en)', async () => {
    for (const locale of ['es', 'en'] as const) {
      const full = await getFullTranslations(locale);
      const combined = [
        (full.seo as unknown as SeoShape).pages.projects,
        (full.seo as unknown as SeoShape).descriptions.projects,
        (full.seo as unknown as SeoShape).h1.projects,
      ].join(' ').toLowerCase();
      const keywords = SEO_INTENT.projects[locale];
      const hit = keywords.some((k) => combined.includes(k));
      expect(hit, `${locale} projects seo copy should frame work as case studies/examples`).toBe(true);
    }
  });

  it('about page carries E-E-A-T intent (es + en)', async () => {
    for (const locale of ['es', 'en'] as const) {
      const full = await getFullTranslations(locale);
      const combined = [
        (full.seo as unknown as SeoShape).pages.about,
        (full.seo as unknown as SeoShape).descriptions.about,
        (full.seo as unknown as SeoShape).h1.about,
      ].join(' ').toLowerCase();
      const keywords = SEO_INTENT.about[locale];
      const hits = keywords.filter((k) => combined.includes(k)).length;
      expect(hits, `${locale} about seo copy should include at least 2 of: ${keywords.join(', ')}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('contact page carries conversion / CTA intent (es + en)', async () => {
    for (const locale of ['es', 'en'] as const) {
      const full = await getFullTranslations(locale);
      const combined = [
        (full.seo as unknown as SeoShape).pages.contact,
        (full.seo as unknown as SeoShape).descriptions.contact,
        (full.seo as unknown as SeoShape).h1.contact,
      ].join(' ').toLowerCase();
      const keywords = SEO_INTENT.contact[locale];
      const hit = keywords.some((k) => combined.includes(k));
      expect(hit, `${locale} contact seo copy should include a CTA framing`).toBe(true);
    }
  });

  it('home seo title/description carry conversion landing intent (es + en)', async () => {
    for (const locale of ['es', 'en'] as const) {
      const full = await getFullTranslations(locale);
      const combined = [(full.seo as unknown as SeoShape).title, (full.seo as unknown as SeoShape).description].join(' ').toLowerCase();
      const keywords = SEO_INTENT.home[locale];
      const hit = keywords.some((k) => combined.includes(k));
      expect(hit, `${locale} home seo copy should include conversion intent`).toBe(true);
    }
  });
});
