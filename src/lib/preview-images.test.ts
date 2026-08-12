import { describe, it, expect } from 'vitest';
import {
  PREVIEW_IMAGE_SPECS,
  getPreviewImageSpec,
  type PreviewSectionId,
} from './preview-images';
import { getTranslations } from '../i18n';

// ---------------------------------------------------------------------------
// home-visual-polish (PR 1 — images): data contract consumed by the four
// funnel preview sections (About, Skills, Projects, Capture). Each section
// renders an Astro <Image /> configured from these specs: descriptive alt
// (via an i18n key that must resolve in es+en and differ between locales),
// an explicit positive width, a 2-density source set, and WebP delivery.
// ---------------------------------------------------------------------------

const EXPECTED_SECTIONS: PreviewSectionId[] = ['about', 'skills', 'projects', 'capture'];

describe('PREVIEW_IMAGE_SPECS', () => {
  it('exposes exactly 4 specs with unique, expected section ids', () => {
    expect(PREVIEW_IMAGE_SPECS).toHaveLength(4);
    const ids = PREVIEW_IMAGE_SPECS.map((spec) => spec.section);
    expect(new Set(ids).size).toBe(4);
    expect(ids.sort()).toEqual([...EXPECTED_SECTIONS].sort());
  });

  it('every spec declares a positive width (about 480, rest 560)', () => {
    const bySection = new Map(PREVIEW_IMAGE_SPECS.map((s) => [s.section, s.width]));
    expect(bySection.get('about')).toBe(480);
    expect(bySection.get('skills')).toBe(560);
    expect(bySection.get('projects')).toBe(560);
    expect(bySection.get('capture')).toBe(560);
    for (const spec of PREVIEW_IMAGE_SPECS) {
      expect(spec.width).toBeGreaterThan(0);
    }
  });

  it('every spec exposes a 2-entry density list containing 2 (1x + 2x)', () => {
    for (const spec of PREVIEW_IMAGE_SPECS) {
      expect(spec.densities).toHaveLength(2);
      expect(spec.densities).toContain(2);
    }
  });

  it('every spec targets WebP delivery', () => {
    for (const spec of PREVIEW_IMAGE_SPECS) {
      expect(spec.formats).toContain('webp');
    }
  });

  it('every spec has a non-empty altKey that is not the key literal itself', () => {
    for (const spec of PREVIEW_IMAGE_SPECS) {
      expect(spec.altKey.length).toBeGreaterThan(0);
      expect(spec.altKey).not.toBe('img');
    }
  });

  it('every altKey resolves to a non-empty string in es and en, differing between locales', async () => {
    const tEs = await getTranslations('es');
    const tEn = await getTranslations('en');
    for (const spec of PREVIEW_IMAGE_SPECS) {
      const esAlt = tEs(spec.altKey);
      const enAlt = tEn(spec.altKey);
      expect(typeof esAlt).toBe('string');
      expect(typeof enAlt).toBe('string');
      expect((esAlt as string).length).toBeGreaterThan(0);
      expect((enAlt as string).length).toBeGreaterThan(0);
      expect(esAlt).not.toBe(spec.altKey);
      expect(enAlt).not.toBe(spec.altKey);
      expect(esAlt).not.toBe(enAlt);
    }
  });

  it('does not duplicate alt copy across different sections (each alt is unique in es)', async () => {
    const tEs = await getTranslations('es');
    const alts = PREVIEW_IMAGE_SPECS.map((spec) => tEs(spec.altKey) as string);
    expect(new Set(alts).size).toBe(4);
  });
});

describe('getPreviewImageSpec', () => {
  it('returns the matching spec for each known section id', () => {
    for (const id of EXPECTED_SECTIONS) {
      const spec = getPreviewImageSpec(id);
      expect(spec.section).toBe(id);
      expect(PREVIEW_IMAGE_SPECS).toContain(spec);
    }
  });

  it('throws a descriptive error for an unknown section id', () => {
    expect(() => getPreviewImageSpec('bogus' as PreviewSectionId)).toThrowError(
      /Unknown preview image section: bogus/,
    );
  });
});
