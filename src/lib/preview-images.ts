export type PreviewSectionId = 'projects';

export interface PreviewImageSpec {
  section: PreviewSectionId;
  altKey: string;
  width: number;
  densities: number[];
  formats: string[];
}

/**
 * Metadata driving the single funnel preview `<Image />` component
 * (Projects). About, Skills, and Capture were replaced by terminal windows
 * (home-skills-terminal / home-capture-audit), so they no longer carry image
 * specs. Asset imports live in the `.astro` section; this module keeps the
 * pure, testable configuration (alt i18n key, width, density set, formats).
 */
export const PREVIEW_IMAGE_SPECS: PreviewImageSpec[] = [
  {
    section: 'projects',
    altKey: 'funnel.projects.imageAlt',
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
