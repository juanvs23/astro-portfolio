import { describe, it, expect, expectTypeOf } from 'vitest';
import { ContentAggregateSchema, type ContentAggregate } from './content-aggregate.js';

const validAggregate = {
  projects: [
    {
      id: 'proj_01',
      name: 'Autopilot CRM',
      url: 'https://example.com/autopilot-crm',
      desc_es: 'CRM con IA.',
      desc_en: 'CRM with AI.',
      imageUrl: '/img/p1.jpg',
      order: 1,
      visible: true,
    },
  ],
  jobs: [
    {
      id: 'job_01',
      title_es: 'Dev',
      title_en: 'Dev',
      company_es: 'Ag',
      company_en: 'Ag',
      start: '2020-01',
      end: '2021-01',
      description_es: 'D.',
      description_en: 'D.',
      order: 0,
      visible: true,
    },
  ],
  siteInfo: {
    id: 'site_01',
    name: 'Juan',
    jobTitle: 'Dev',
    url: 'https://coltmandev.dev',
    telephone: '+58 424 831 0009',
    logo: '/favicon.svg',
    brandName: 'Juan',
    twitterHandle: '@juanvs23',
    sameAs: ['https://github.com/juanvs23'],
  },
  nav: [{ id: 'nav_01', key: 'menu.about', path: '/about', order: 1, visible: true }],
  social: [
    { id: 'soc_01', name: 'GitHub', href: 'https://github.com/juanvs23', icon: 'github', order: 0, visible: true },
  ],
} as const;

describe('ContentAggregateSchema', () => {
  it('parses a populated aggregate with all five keys', () => {
    const result = ContentAggregateSchema.safeParse(validAggregate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projects).toHaveLength(1);
      expect(result.data.jobs).toHaveLength(1);
      expect(result.data.nav).toHaveLength(1);
      expect(result.data.social).toHaveLength(1);
      expect(result.data.siteInfo.name).toBe('Juan');
    }
  });

  it('rejects an aggregate whose nav entry is invalid', () => {
    const bad = { ...validAggregate, nav: [{ id: 'nav_01', key: 'menu.about' }] };
    const result = ContentAggregateSchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('nav.0.path');
    }
  });

  it('rejects an aggregate missing the siteInfo key', () => {
    const { siteInfo: _dropped, ...missing } = validAggregate;
    const result = ContentAggregateSchema.safeParse(missing);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('siteInfo');
    }
  });

  it('infers a ContentAggregate type equal to the parsed output', () => {
    const parsed = ContentAggregateSchema.parse(validAggregate);
    expectTypeOf(parsed).toEqualTypeOf<ContentAggregate>();
    const [firstProject] = parsed.projects;
    expect(firstProject?.name).toBe('Autopilot CRM');
  });
});