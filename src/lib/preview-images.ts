export type PreviewSectionId = 'about' | 'skills' | 'projects' | 'capture';

export interface PreviewImageSpec {
  section: PreviewSectionId;
  altKey: string;
  width: number;
  densities: number[];
  formats: string[];
}

/**
 * Metadata driving the four funnel preview `<Image />` components.
 * Asset imports live in each `.astro` section; this module keeps the
 * pure, testable configuration (alt i18n key, width, density set, formats).
 */
export const PREVIEW_IMAGE_SPECS: PreviewImageSpec[] = [
  {
    section: 'about',
    altKey: 'funnel.about.imageAlt',
    width: 480,
    densities: [1, 2],
    formats: ['webp'],
  },
  {
    section: 'skills',
    altKey: 'funnel.skills.imageAlt',
    width: 560,
    densities: [1, 2],
    formats: ['webp'],
  },
  {
    section: 'projects',
    altKey: 'funnel.projects.imageAlt',
    width: 560,
    densities: [1, 2],
    formats: ['webp'],
  },
  {
    section: 'capture',
    altKey: 'funnel.capture.imageAlt',
    width: 560,
    densities: [1, 2],
    formats: ['webp'],
  },
];

export function getPreviewImageSpec(id: PreviewSectionId): PreviewImageSpec {
  const spec = PREVIEW_IMAGE_SPECS.find((entry) => entry.section === id);
  if (!spec) {
    throw new Error(`Unknown preview image section: ${id}`);
  }
  return spec;
}
