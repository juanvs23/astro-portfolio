import type { Project, Job, SiteInfo, NavLink, SocialLink } from '@cms/contracts';

/**
 * Minimal shape of a persisted Mongoose doc that all resources share: an
 * ObjectId `_id` plus the resource's own fields. The transforms only read
 * `_id` and the documented fields, so they accept both hydrated and lean docs.
 */
interface MongoDoc {
  _id: { toString(): string };
}

export interface ProjectDocShape extends MongoDoc {
  name: string;
  url: string;
  desc_es: string;
  desc_en: string;
  imageUrl: string;
  order: number;
  visible: boolean;
}

export interface JobDocShape extends MongoDoc {
  title_es: string;
  title_en: string;
  company_es: string;
  company_en: string;
  start: string;
  end: string;
  description_es: string;
  description_en: string;
  order: number;
  visible: boolean;
}

export interface SiteInfoDocShape extends MongoDoc {
  name: string;
  jobTitle: string;
  url: string;
  telephone: string;
  logo: string;
  brandName: string;
  twitterHandle: string;
  sameAs: string[];
}

export interface NavLinkDocShape extends MongoDoc {
  key: string;
  path: string;
  order: number;
  visible: boolean;
}

export interface SocialLinkDocShape extends MongoDoc {
  name: string;
  href: string;
  icon: string;
  order: number;
  visible: boolean;
}

/** Maps a persisted Mongo project doc to the public `Project` contract shape. */
export function toPublicProject(doc: ProjectDocShape): Project {
  return {
    id: doc._id.toString(),
    name: doc.name,
    url: doc.url,
    desc_es: doc.desc_es,
    desc_en: doc.desc_en,
    imageUrl: doc.imageUrl,
    order: doc.order,
    visible: doc.visible,
  };
}

/** Maps a persisted Mongo job doc to the public `Job` contract shape. */
export function toPublicJob(doc: JobDocShape): Job {
  return {
    id: doc._id.toString(),
    title_es: doc.title_es,
    title_en: doc.title_en,
    company_es: doc.company_es,
    company_en: doc.company_en,
    start: doc.start,
    end: doc.end,
    description_es: doc.description_es,
    description_en: doc.description_en,
    order: doc.order,
    visible: doc.visible,
  };
}

/** Maps a persisted Mongo siteInfo doc to the public `SiteInfo` contract shape. */
export function toPublicSiteInfo(doc: SiteInfoDocShape): SiteInfo {
  return {
    id: doc._id.toString(),
    name: doc.name,
    jobTitle: doc.jobTitle,
    url: doc.url,
    telephone: doc.telephone,
    logo: doc.logo,
    brandName: doc.brandName,
    twitterHandle: doc.twitterHandle,
    sameAs: doc.sameAs,
  };
}

/** Maps a persisted Mongo navLink doc to the public `NavLink` contract shape. */
export function toPublicNavLink(doc: NavLinkDocShape): NavLink {
  return {
    id: doc._id.toString(),
    key: doc.key,
    path: doc.path,
    order: doc.order,
    visible: doc.visible,
  };
}

/** Maps a persisted Mongo socialLink doc to the public `SocialLink` contract shape. */
export function toPublicSocialLink(doc: SocialLinkDocShape): SocialLink {
  return {
    id: doc._id.toString(),
    name: doc.name,
    href: doc.href,
    icon: doc.icon,
    order: doc.order,
    visible: doc.visible,
  };
}