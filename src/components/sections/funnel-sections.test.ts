import { describe, it, expect } from 'vitest';
import { getTranslations } from '../../i18n';
import { buildFunnelContactPayload, buildWhatsAppLink } from '../../lib/funnel-lead';

// ---------------------------------------------------------------------------
// PR₄ (home-funnel-landing): data contracts consumed by the final funnel
// sections — SocialProofSection, CaptureSection (audit form), PricingBofuSection,
// FaqSection, ContactCtaSection (final form). These components
// are presentational Astro templates, so the TDD unit is the i18n payload they
// render plus the pure payload/WhatsApp synthesis the lead-form script wires.
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

interface FaqItem {
  question: string;
  answer: string;
}

const FINAL_SECTION_STRING_KEYS = [
  // SocialProofSection (section 5)
  'funnel.proof.heading',
  'funnel.proof.benefits',
  // PricingBofuSection (section 9)
  'funnel.pricing.heading',
  'funnel.pricing.description',
  'funnel.pricing.cta',
  'funnel.pricing.linkout',
  'funnel.pricing.delivery',
  // FaqSection (section 10)
  'funnel.faq_heading',
  // CaptureSection / ContactCtaSection (sections 8 & 11)
  'funnel.audit.heading',
  'funnel.audit.description',
  'funnel.audit.cta',
  'funnel.audit.subject',
  'funnel.audit.message',
  'funnel.contact.heading',
  'funnel.contact.description',
  'funnel.contact.cta',
  'funnel.contact.subject',
  'funnel.contact.message',
  // Footer (section 12)
  'funnel.footer.heading',
  'funnel.footer.tagline',
  // Contact backend / status copy
  'contact.whatsappNumber',
  'contact.form.sending',
  'contact.form.success',
  'contact.form.error',
  'contact.form.networkError',
  // Field labels rendered by the lead forms
  'inputField.fullName',
  'inputField.email',
  'inputField.send',
];

for (const key of FINAL_SECTION_STRING_KEYS) {
  it(`final section key ${key} resolves non-empty (es)`, async () => {
    const t = await getTranslations('es');
    const value = t(key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
    expect(value).not.toBe(key);
  });

  it(`final section key ${key} resolves non-empty (en)`, async () => {
    const t = await getTranslations('en');
    const value = t(key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
    expect(value).not.toBe(key);
  });
}

describe('social proof data shape (funnel.proof)', () => {
  it('metrics ground the 60/40/99.9/45 figures from portfolio data (es)', async () => {
    const t = await getTranslations('es');
    const metrics = t.object('funnel.proof.metrics') as string[];
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBeGreaterThanOrEqual(4);
    const joined = metrics.join(' ');
    expect(joined).toContain('60%');
    expect(joined).toContain('40%');
    expect(joined).toContain('99.9%');
    expect(joined).toContain('45%');
  });

  it('proof heading and benefits differ between locales', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    expect(tEs('funnel.proof.heading')).not.toBe(tEn('funnel.proof.heading'));
    expect(tEs('funnel.proof.benefits')).not.toBe(tEn('funnel.proof.benefits'));
  });
});

describe('BOFU pricing data shape (services.webPlans + launchPricing)', () => {
  it('webPlans has the 3 tiers with from-prices 120/250/500 and delivery (es)', async () => {
    const t = await getTranslations('es');
    const plans = t.object('services.webPlans') as WebPlan[];
    expect(Array.isArray(plans)).toBe(true);
    expect(plans).toHaveLength(3);
    expect(plans.map((p) => p.startingPrice)).toEqual([120, 250, 500]);
    for (const plan of plans) {
      expect(plan.id).toMatch(/^(basic|professional|ecommerce)$/);
      expect(plan.name.length).toBeGreaterThan(0);
      expect(plan.delivery.length).toBeGreaterThan(0);
      expect(plan.cta.length).toBeGreaterThan(0);
      expect(plan.features.length).toBeGreaterThanOrEqual(3);
    }
    expect(plans[1].recommended).toBe(true);
  });

  it('launchPricing badge + note (15% off) resolve and render near cards (es)', async () => {
    const t = await getTranslations('es');
    const lp = t.object('services.launchPricing') as { badge: string; note: string };
    expect(lp.badge).toContain('15%');
    expect(lp.note.length).toBeGreaterThan(0);
  });
});

describe('FAQ data shape (funnel.faq)', () => {
  it('es FAQ items cover price, delivery, support and no-commitment objections', async () => {
    const t = await getTranslations('es');
    const faq = t.object('funnel.faq') as FaqItem[];
    expect(Array.isArray(faq)).toBe(true);
    expect(faq.length).toBeGreaterThanOrEqual(4);
    expect(faq.length).toBeLessThanOrEqual(6);
    const answers = faq.map((f) => f.answer.toLowerCase()).join(' ');
    const questions = faq.map((f) => f.question.toLowerCase()).join(' ');
    expect(answers + questions).toMatch(/costo|precio|presupuesto/);
    expect(answers + questions).toMatch(/d[ií]as|entrega|plazo/);
    expect(answers + questions).toMatch(/soporte|mantenimiento/);
    expect(answers + questions).toMatch(/sin compromiso|compromiso/);
  });
});

describe('lead form payload wiring (CaptureSection + ContactCtaSection)', () => {
  it('audit context synthesizes the payload the form posts, using localized copy (es)', async () => {
    const t = await getTranslations('es');
    const payload = buildFunnelContactPayload(
      { name: 'Ana Pérez', email: 'ana@example.com' },
      'audit',
      { subject: t('funnel.audit.subject') as string, message: t('funnel.audit.message') as string },
    );
    expect(payload).toEqual({
      name: 'Ana Pérez',
      phone: '',
      email: 'ana@example.com',
      subject: 'Auditoría gratuita',
      message: 'Quiero una auditoría gratuita para mi negocio.',
    });
  });

  it('contact context synthesizes the final-CTA payload with localized copy (es)', async () => {
    const t = await getTranslations('es');
    const payload = buildFunnelContactPayload(
      { name: 'Ana Pérez', email: 'ana@example.com' },
      'contact',
      { subject: t('funnel.contact.subject') as string, message: t('funnel.contact.message') as string },
    );
    expect(payload.phone).toBe('');
    expect(payload.subject.length).toBeGreaterThan(0);
    expect(payload.subject).not.toBe('funnel.contact.subject');
    expect(payload.message.length).toBeGreaterThan(0);
    expect(payload.message).not.toBe('funnel.contact.message');
  });

  it('hybrid WhatsApp deep-link stays available with the audit conversion copy (es)', async () => {
    const t = await getTranslations('es');
    const link = buildWhatsAppLink(t('contact.whatsappNumber') as string, t('funnel.audit.message') as string);
    expect(link.startsWith('https://wa.me/584248310009?text=')).toBe(true);
    expect(decodeURIComponent(link)).toContain('Quiero una auditoría gratuita');
  });

  it('hybrid WhatsApp deep-link uses the contact conversion copy for the final CTA (es)', async () => {
    const t = await getTranslations('es');
    const link = buildWhatsAppLink(t('contact.whatsappNumber') as string, t('funnel.contact.message') as string);
    expect(link.startsWith('https://wa.me/584248310009?text=')).toBe(true);
    expect(decodeURIComponent(link)).toContain('propuesta');
  });
});
