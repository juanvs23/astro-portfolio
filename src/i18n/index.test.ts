import { describe, it, expect } from 'vitest';
import { getTranslations } from '../i18n';

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
