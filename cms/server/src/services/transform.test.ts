import { describe, it, expect } from 'vitest';
import { ProjectSchema, JobSchema, SiteInfoSchema, NavLinkSchema, SocialLinkSchema } from '@cms/contracts';
import {
  toPublicProject,
  toPublicJob,
  toPublicSiteInfo,
  toPublicNavLink,
  toPublicSocialLink,
} from './transform.js';

const oid = (hex = '507f1f77bcf86cd799439011') => ({ toString: () => hex });

describe('toPublicProject (task 2.1)', () => {
  it('maps a Mongo project doc to the public Project shape (_id → id)', () => {
    const doc = {
      _id: oid(),
      name: 'Gericht',
      url: 'https://restaurant.coltmandev.dev/',
      desc_es: 'Landing restaurante',
      desc_en: 'Restaurant landing',
      imageUrl: 'gericht',
      order: 1,
      visible: true,
    };
    const out = toPublicProject(doc);
    expect(out).toEqual({
      id: '507f1f77bcf86cd799439011',
      name: 'Gericht',
      url: 'https://restaurant.coltmandev.dev/',
      desc_es: 'Landing restaurante',
      desc_en: 'Restaurant landing',
      imageUrl: 'gericht',
      order: 1,
      visible: true,
    });
    expect(ProjectSchema.parse(out)).toEqual(out);
  });
});

describe('toPublicJob (task 2.1)', () => {
  it('maps a Mongo job doc to the public Job shape with bilingual fields', () => {
    const doc = {
      _id: oid(),
      title_es: 'Desarrollador',
      title_en: 'Developer',
      company_es: 'Empresa',
      company_en: 'Company',
      start: '2024-5',
      end: '2025-11',
      description_es: 'Trabajo',
      description_en: 'Job',
      order: 2,
      visible: true,
    };
    const out = toPublicJob(doc);
    expect(out).toEqual({
      id: '507f1f77bcf86cd799439011',
      title_es: 'Desarrollador',
      title_en: 'Developer',
      company_es: 'Empresa',
      company_en: 'Company',
      start: '2024-5',
      end: '2025-11',
      description_es: 'Trabajo',
      description_en: 'Job',
      order: 2,
      visible: true,
    });
    expect(JobSchema.parse(out)).toEqual(out);
  });
});

describe('toPublicSiteInfo (task 2.1)', () => {
  it('maps a Mongo siteInfo doc to the public SiteInfo shape', () => {
    const doc = {
      _id: oid(),
      name: 'Juan Carlos Ávila',
      jobTitle: 'Web Developer + AI Automation',
      url: 'https://coltmandev.dev',
      telephone: '+58 424 831 0009',
      logo: '/favicon.svg',
      brandName: 'Juan Carlos Ávila',
      twitterHandle: '@juanvs23',
      sameAs: ['https://github.com/juanvs23'],
    };
    const out = toPublicSiteInfo(doc);
    expect(out).toEqual({
      id: '507f1f77bcf86cd799439011',
      name: 'Juan Carlos Ávila',
      jobTitle: 'Web Developer + AI Automation',
      url: 'https://coltmandev.dev',
      telephone: '+58 424 831 0009',
      logo: '/favicon.svg',
      brandName: 'Juan Carlos Ávila',
      twitterHandle: '@juanvs23',
      sameAs: ['https://github.com/juanvs23'],
    });
    expect(SiteInfoSchema.parse(out)).toEqual(out);
  });
});

describe('toPublicNavLink (task 2.1)', () => {
  it('maps a Mongo navLink doc to the public NavLink shape (key/path)', () => {
    const doc = {
      _id: oid(),
      key: 'menu.home',
      path: '/',
      order: 0,
      visible: true,
    };
    const out = toPublicNavLink(doc);
    expect(out).toEqual({
      id: '507f1f77bcf86cd799439011',
      key: 'menu.home',
      path: '/',
      order: 0,
      visible: true,
    });
    expect(NavLinkSchema.parse(out)).toEqual(out);
  });
});

describe('toPublicSocialLink (task 2.1)', () => {
  it('maps a Mongo socialLink doc to the public SocialLink shape (name/href/icon)', () => {
    const doc = {
      _id: oid(),
      name: 'GitHub',
      href: 'https://github.com/juanvs23',
      icon: 'github',
      order: 0,
      visible: true,
    };
    const out = toPublicSocialLink(doc);
    expect(out).toEqual({
      id: '507f1f77bcf86cd799439011',
      name: 'GitHub',
      href: 'https://github.com/juanvs23',
      icon: 'github',
      order: 0,
      visible: true,
    });
    expect(SocialLinkSchema.parse(out)).toEqual(out);
  });
});