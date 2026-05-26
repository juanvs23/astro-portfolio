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
