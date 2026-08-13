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

// ---------------------------------------------------------------------------
// home-visual-polish (task 1.9 + phase 3 — terminals): the About and Skills
// preview sections render terminal windows, so their imageAlt keys are gone.
// The two remaining preview images (Projects, Capture) keep their alt keys,
// and the terminal windows get a bilingual title + lines contract
// (funnel.about.terminal / funnel.skills.terminal).
// ---------------------------------------------------------------------------

const PREVIEW_IMAGE_ALT_KEYS = [
  'funnel.projects.imageAlt',
  'funnel.capture.imageAlt',
];

for (const key of PREVIEW_IMAGE_ALT_KEYS) {
  it(`preview image alt key ${key} resolves non-empty, not the key literal (es)`, async () => {
    const t = await getTranslations('es');
    const value = t(key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
    expect(value).not.toBe(key);
  });

  it(`preview image alt key ${key} resolves non-empty, not the key literal (en)`, async () => {
    const t = await getTranslations('en');
    const value = t(key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
    expect(value).not.toBe(key);
  });
}

describe('preview image alt keys differ between locales', () => {
  it('the two remaining funnel.*.imageAlt values are translated (es ≠ en)', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    for (const key of PREVIEW_IMAGE_ALT_KEYS) {
      expect(tEs(key)).not.toBe(tEn(key));
    }
  });
});

interface TerminalContract {
  title: string;
  lines: string[];
}

const PREVIEW_TERMINAL_KEYS = ['funnel.about.terminal', 'funnel.skills.terminal'];

for (const key of PREVIEW_TERMINAL_KEYS) {
  it(`terminal ${key} has a non-empty title that is not the key literal (es)`, async () => {
    const t = await getTranslations('es');
    const terminal = t(key) as TerminalContract;
    expect(typeof terminal).toBe('object');
    expect(terminal.title.length).toBeGreaterThan(0);
    expect(terminal.title).not.toBe(key);
    expect(terminal.title).not.toBe('img');
  });

  it(`terminal ${key} has a non-empty title that is not the key literal (en)`, async () => {
    const t = await getTranslations('en');
    const terminal = t(key) as TerminalContract;
    expect(typeof terminal).toBe('object');
    expect(terminal.title.length).toBeGreaterThan(0);
    expect(terminal.title).not.toBe(key);
  });

  it(`terminal ${key} lines are non-empty, not the key literal (es)`, async () => {
    const t = await getTranslations('es');
    const terminal = t(key) as TerminalContract;
    expect(Array.isArray(terminal.lines)).toBe(true);
    expect(terminal.lines.length).toBeGreaterThanOrEqual(2);
    for (const line of terminal.lines) {
      expect(typeof line).toBe('string');
      expect(line.length).toBeGreaterThan(0);
      expect(line).not.toBe(key);
      expect(line).not.toBe('img');
    }
  });

  it(`terminal ${key} lines are non-empty, not the key literal (en)`, async () => {
    const t = await getTranslations('en');
    const terminal = t(key) as TerminalContract;
    expect(Array.isArray(terminal.lines)).toBe(true);
    expect(terminal.lines.length).toBeGreaterThanOrEqual(2);
    for (const line of terminal.lines) {
      expect(typeof line).toBe('string');
      expect(line.length).toBeGreaterThan(0);
      expect(line).not.toBe(key);
    }
  });
}

describe('preview terminal line sets differ between locales', () => {
  it('about and skills terminal lines are translated (es ≠ en)', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    for (const key of PREVIEW_TERMINAL_KEYS) {
      const esLines = (tEs(key) as TerminalContract).lines;
      const enLines = (tEn(key) as TerminalContract).lines;
      expect(esLines.join('|')).not.toBe(enLines.join('|'));
    }
  });
});

// ---------------------------------------------------------------------------
// home-visual-polish (task 3.13 — audit terminal): the Capture preview section
// renders an audit terminal with a command line, metric rows (label, value,
// progress bar width) and a recommendation line, all driven by
// funnel.audit.terminal.* (es + en).
// ---------------------------------------------------------------------------

interface AuditRow {
  label: string;
  value: string;
  bar: string;
}

interface AuditTerminalContract {
  title: string;
  command: string;
  rows: AuditRow[];
  recommendation: string;
}

const AUDIT_TERMINAL_KEYS = ['funnel.audit.terminal'];

for (const key of AUDIT_TERMINAL_KEYS) {
  it(`audit terminal ${key} has a non-empty title that is not the key literal (es)`, async () => {
    const t = await getTranslations('es');
    const terminal = t(key) as AuditTerminalContract;
    expect(typeof terminal).toBe('object');
    expect(terminal.title.length).toBeGreaterThan(0);
    expect(terminal.title).not.toBe(key);
    expect(terminal.title).not.toBe('img');
  });

  it(`audit terminal ${key} has a non-empty title that is not the key literal (en)`, async () => {
    const t = await getTranslations('en');
    const terminal = t(key) as AuditTerminalContract;
    expect(typeof terminal).toBe('object');
    expect(terminal.title.length).toBeGreaterThan(0);
    expect(terminal.title).not.toBe(key);
  });

  it(`audit terminal ${key} has a non-empty command that is not the key literal (es)`, async () => {
    const t = await getTranslations('es');
    const terminal = t(key) as AuditTerminalContract;
    expect(terminal.command.length).toBeGreaterThan(0);
    expect(terminal.command).not.toBe(key);
    expect(terminal.command).toContain('npx audit');
  });

  it(`audit terminal ${key} has a non-empty command that is not the key literal (en)`, async () => {
    const t = await getTranslations('en');
    const terminal = t(key) as AuditTerminalContract;
    expect(terminal.command.length).toBeGreaterThan(0);
    expect(terminal.command).not.toBe(key);
    expect(terminal.command).toContain('npx audit');
  });

  it(`audit terminal ${key} exposes at least 3 metric rows with label/value/bar (es)`, async () => {
    const t = await getTranslations('es');
    const terminal = t(key) as AuditTerminalContract;
    expect(Array.isArray(terminal.rows)).toBe(true);
    expect(terminal.rows.length).toBeGreaterThanOrEqual(3);
    for (const row of terminal.rows) {
      expect(typeof row.label).toBe('string');
      expect(row.label.length).toBeGreaterThan(0);
      expect(row.label).not.toBe(key);
      expect(typeof row.value).toBe('string');
      expect(row.value.length).toBeGreaterThan(0);
      expect(typeof row.bar).toBe('string');
      expect(row.bar.length).toBeGreaterThan(0);
      expect(Number(row.bar)).toBeGreaterThan(0);
      expect(Number(row.bar)).toBeLessThanOrEqual(100);
    }
  });

  it(`audit terminal ${key} exposes at least 3 metric rows with label/value/bar (en)`, async () => {
    const t = await getTranslations('en');
    const terminal = t(key) as AuditTerminalContract;
    expect(Array.isArray(terminal.rows)).toBe(true);
    expect(terminal.rows.length).toBeGreaterThanOrEqual(3);
    for (const row of terminal.rows) {
      expect(typeof row.label).toBe('string');
      expect(row.label.length).toBeGreaterThan(0);
      expect(row.label).not.toBe(key);
      expect(typeof row.value).toBe('string');
      expect(row.value.length).toBeGreaterThan(0);
      expect(typeof row.bar).toBe('string');
      expect(row.bar.length).toBeGreaterThan(0);
      expect(Number(row.bar)).toBeGreaterThan(0);
      expect(Number(row.bar)).toBeLessThanOrEqual(100);
    }
  });

  it(`audit terminal ${key} has a non-empty recommendation that is not the key literal (es)`, async () => {
    const t = await getTranslations('es');
    const terminal = t(key) as AuditTerminalContract;
    expect(terminal.recommendation.length).toBeGreaterThan(0);
    expect(terminal.recommendation).not.toBe(key);
  });

  it(`audit terminal ${key} has a non-empty recommendation that is not the key literal (en)`, async () => {
    const t = await getTranslations('en');
    const terminal = t(key) as AuditTerminalContract;
    expect(terminal.recommendation.length).toBeGreaterThan(0);
    expect(terminal.recommendation).not.toBe(key);
  });
}

describe('audit terminal content differs between locales', () => {
  it('audit command and recommendation are translated (es ≠ en)', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    for (const key of AUDIT_TERMINAL_KEYS) {
      const es = tEs(key) as AuditTerminalContract;
      const en = tEn(key) as AuditTerminalContract;
      expect(es.command).not.toBe(en.command);
      expect(es.recommendation).not.toBe(en.recommendation);
    }
  });

  it('audit metric rows differ between locales (es ≠ en)', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    for (const key of AUDIT_TERMINAL_KEYS) {
      const es = tEs(key) as AuditTerminalContract;
      const en = tEn(key) as AuditTerminalContract;
      const esRows = es.rows.map((r) => `${r.label}|${r.value}|${r.bar}`).join('||');
      const enRows = en.rows.map((r) => `${r.label}|${r.value}|${r.bar}`).join('||');
      expect(esRows).not.toBe(enRows);
    }
  });
});

describe('removed preview image alt keys', () => {
  it('funnel.about.imageAlt and funnel.skills.imageAlt no longer resolve in es or en', async () => {
    for (const locale of ['es', 'en'] as const) {
      const t = await getTranslations(locale);
      expect(t('funnel.about.imageAlt')).toBe('funnel.about.imageAlt');
      expect(t('funnel.skills.imageAlt')).toBe('funnel.skills.imageAlt');
    }
  });
});

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

// ---------------------------------------------------------------------------
// PR₄ (home-funnel-landing): data contracts consumed by the interaction / BOFU
// / FAQ / social / footer sections. Components are presentational Astro
// templates; the TDD unit is the i18n payload they render.
// ---------------------------------------------------------------------------

interface FaqItem {
  question: string;
  answer: string;
}

interface WebPlan {
  name: string;
  startingPrice: number;
  delivery: string;
  recommended: boolean;
  features: string[];
  cta: string;
}

const PR4_STRING_KEYS = [
  // PricingBofuSection (section 9)
  'funnel.pricing.delivery',
  // FaqSection (section 10)
  'funnel.faq_heading',
  // Footer (section 12)
  'funnel.footer.heading',
  'funnel.footer.tagline',
  // CaptureSection (section 8) — label reused in LeadForm
  'funnel.audit.cta',
  // PricingBofuSection CTA
  'funnel.pricing.cta',
  // ContactCtaSection (section 11)
  'funnel.contact.cta',
];

for (const key of PR4_STRING_KEYS) {
  it(`PR4 section key ${key} resolves non-empty (es)`, async () => {
    const t = await getTranslations('es');
    const value = t(key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
    expect(value).not.toBe(key);
  });

  it(`PR4 section key ${key} resolves non-empty (en)`, async () => {
    const t = await getTranslations('en');
    const value = t(key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
    expect(value).not.toBe(key);
  });
}

describe('social proof section data shape', () => {
  it('funnel.proof.metrics provides at least 4 measurable claims (es)', async () => {
    const t = await getTranslations('es');
    const metrics = t('funnel.proof.metrics') as string[];
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBeGreaterThanOrEqual(4);
    for (const metric of metrics) {
      expect(typeof metric).toBe('string');
      expect(metric.length).toBeGreaterThan(0);
    }
  });

  it('funnel.proof.metrics contains the four key claims (en)', async () => {
    const t = await getTranslations('en');
    const metrics = t('funnel.proof.metrics') as string[];
    expect(metrics.some((m) => m.includes('60%'))).toBe(true);
    expect(metrics.some((m) => m.includes('40%'))).toBe(true);
    expect(metrics.some((m) => m.includes('99.9%'))).toBe(true);
    expect(metrics.some((m) => m.includes('45%'))).toBe(true);
  });

  it('funnel.proof.results provides at least 2 result bullets (both locales)', async () => {
    for (const locale of ['es', 'en']) {
      const t = await getTranslations(locale as 'es' | 'en');
      const results = t('funnel.proof.results') as string[];
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(2);
      for (const result of results) {
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('faq section data shape', () => {
  it('funnel.faq provides 4-6 items each with non-empty question and answer (es)', async () => {
    const t = await getTranslations('es');
    const faq = t('funnel.faq') as FaqItem[];
    expect(Array.isArray(faq)).toBe(true);
    expect(faq.length).toBeGreaterThanOrEqual(4);
    expect(faq.length).toBeLessThanOrEqual(6);
    for (const item of faq) {
      expect(item.question.length).toBeGreaterThan(0);
      expect(item.answer.length).toBeGreaterThan(0);
    }
  });

  it('funnel.faq answers are visible without JS (es static check)', async () => {
    const t = await getTranslations('es');
    const faq = t('funnel.faq') as FaqItem[];
    // Static Q&A content: answers must be present in the data so they render
    // in the no-JS HTML. The accordion component applies hiding via JS only.
    for (const item of faq) {
      expect(item.answer).toBeTruthy();
      // Answers should be substantive, not a single token
      expect(item.answer.split(/\s+/).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('funnel.faq covers key objection themes (es)', async () => {
    const t = await getTranslations('es');
    const faq = t('funnel.faq') as FaqItem[];
    const allText = faq.map((i) => i.question + ' ' + i.answer).join(' ');
    expect(allText).toMatch(/cuesta|precio|presupuesto/i);
    expect(allText).toMatch(/tiempo|día|seman/i);
    expect(allText).toMatch(/lanzamiento|soporte|documentación/i);
    expect(allText).toMatch(/compromiso|costo|gratuita/i);
  });
});

describe('pricing bofu section data shape', () => {
  it('funnel.pricing.delivery differs between locales', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('funnel.pricing.delivery')).not.toBe(tEn('funnel.pricing.delivery'));
  });

  it('services.webPlans provides 3 plans for BOFU display (both locales)', async () => {
    for (const locale of ['es', 'en']) {
      const t = await getTranslations(locale as 'es' | 'en');
      const plans = t('services.webPlans') as WebPlan[];
      expect(Array.isArray(plans)).toBe(true);
      expect(plans).toHaveLength(3);
      expect(plans[0].startingPrice).toBe(120);
      expect(plans[1].startingPrice).toBe(250);
      expect(plans[2].startingPrice).toBe(500);
      for (const plan of plans) {
        expect(plan.name.length).toBeGreaterThan(0);
        expect(plan.delivery.length).toBeGreaterThan(0);
        expect(Array.isArray(plan.features)).toBe(true);
        expect(plan.features.length).toBeGreaterThanOrEqual(4);
        expect(plan.cta.length).toBeGreaterThan(0);
      }
    }
  });

  it('services.launchPricing provides badge and note (both locales)', async () => {
    for (const locale of ['es', 'en']) {
      const t = await getTranslations(locale as 'es' | 'en');
      const launch = t('services.launchPricing') as { badge: string; note: string };
      expect(launch.badge.length).toBeGreaterThan(0);
      expect(launch.badge).toMatch(/15%/);
      expect(launch.note.length).toBeGreaterThan(0);
    }
  });
});

describe('footer section data contract', () => {
  it('funnel.footer keys differ between locales', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('funnel.footer.heading')).not.toBe(tEn('funnel.footer.heading'));
    expect(tEs('funnel.footer.tagline')).not.toBe(tEn('funnel.footer.tagline'));
  });
});