import { describe, it, expect } from 'vitest';
import {
  PREVIEW_IMAGE_SPECS,
  getPreviewImageSpec,
  type PreviewSectionId,
} from './preview-images';
import { getTranslations } from '../i18n';

// ---------------------------------------------------------------------------
// home-visual-polish (task 1.9 — image contract shrink): the About, Skills,
// and Capture preview sections were replaced by terminal windows, so the
// image pipeline now covers exactly one section (Projects). Each spec drives
// an Astro <Image />: descriptive alt (i18n key resolving in es+en, differing
// between locales), explicit positive width, a 2-density source set, WebP.
// ---------------------------------------------------------------------------

const EXPECTED_SECTIONS: PreviewSectionId[] = ['projects'];

describe('PREVIEW_IMAGE_SPECS', () => {
  it('exposes exactly 1 spec with the expected section id (projects only)', () => {
    expect(PREVIEW_IMAGE_SPECS).toHaveLength(1);
    const ids = PREVIEW_IMAGE_SPECS.map((spec) => spec.section);
    expect(new Set(ids).size).toBe(1);
    expect(ids.sort()).toEqual([...EXPECTED_SECTIONS].sort());
  });

  it('every spec declares a positive width (560 for the remaining projects section)', () => {
    const bySection = new Map(PREVIEW_IMAGE_SPECS.map((s) => [s.section, s.width]));
    expect(bySection.get('projects')).toBe(560);
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

  it('does not resolve to the key literal for the remaining section (es)', async () => {
    const tEs = await getTranslations('es');
    for (const spec of PREVIEW_IMAGE_SPECS) {
      expect(tEs(spec.altKey)).not.toBe(spec.altKey);
    }
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

  it('throws a descriptive error for removed section ids (about, skills, capture) and unknowns', () => {
    for (const id of ['about', 'skills', 'capture', 'bogus']) {
      expect(() => getPreviewImageSpec(id as PreviewSectionId)).toThrowError(
        new RegExp(`Unknown preview image section: ${id}`),
      );
    }
  });
});
