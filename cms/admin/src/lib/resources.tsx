import type { ComponentType, ReactNode } from 'react';
import { ProjectForm, type ProjectInput } from '../forms/ProjectForm';
import { JobForm, type JobInput } from '../forms/JobForm';
import { NavForm, type NavInput } from '../forms/NavForm';
import { SocialForm, type SocialInput } from '../forms/SocialForm';
import type { AdminResource } from './types';

/** Contract shared by every resource form: controlled value in, submit out. */
export interface ResourceFormProps<T> {
  initial?: Partial<T>;
  onSubmit: (v: T) => void;
  busy?: boolean;
  submitLabel?: string;
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

/** A resource definition. `R` is the persisted row shape (has `id`); `F` is
 *  the form input shape (no `id` — the server assigns it). */
export interface ResourceDef<R extends { id: string }, F> {
  /** Route segment + query key, e.g. 'projects'. */
  key: string;
  /** Sidebar / page title. */
  title: string;
  /** Admin API path suffix, e.g. '/projects'. */
  apiPath: string;
  columns: Column<R>[];
  Form: ComponentType<ResourceFormProps<F>>;
  rowKey: (item: R) => string;
}

/** Erased definition used by the generic ResourcePage + route adapter. */
export type AnyResourceDef = ResourceDef<AdminResource, any>;

function Visible({ value }: { value: boolean }) {
  return <span className={value ? 'text-success' : 'text-mute'}>{value ? '✓' : '–'}</span>;
}

export const PROJECT_DEF: ResourceDef<{
  id: string; name: string; url: string; desc_es: string; desc_en: string;
  imageUrl: string; order: number; visible: boolean;
}, ProjectInput> = {
  key: 'projects',
  title: 'Proyectos',
  apiPath: '/projects',
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'url', header: 'URL', render: (p) => <span className="text-mute">{p.url}</span> },
    { key: 'order', header: 'Order' },
    { key: 'visible', header: 'Vis', render: (p) => <Visible value={p.visible} /> },
  ],
  Form: ProjectForm,
  rowKey: (p) => p.id,
};

export const JOB_DEF: ResourceDef<{
  id: string; title_es: string; title_en: string; company_es: string; company_en: string;
  start: string; end: string; description_es: string; description_en: string; order: number; visible: boolean;
}, JobInput> = {
  key: 'jobs',
  title: 'Experiencia',
  apiPath: '/jobs',
  columns: [
    { key: 'title_en', header: 'Title', render: (j) => j.title_en || j.title_es },
    { key: 'company_en', header: 'Company', render: (j) => j.company_en || j.company_es },
    { key: 'period', header: 'Period', render: (j) => `${j.start} – ${j.end || '…'}` },
    { key: 'order', header: 'Order' },
    { key: 'visible', header: 'Vis', render: (j) => <Visible value={j.visible} /> },
  ],
  Form: JobForm,
  rowKey: (j) => j.id,
};

export const NAV_DEF: ResourceDef<{
  id: string; key: string; path: string; order: number; visible: boolean;
}, NavInput> = {
  key: 'nav',
  title: 'Navegación',
  apiPath: '/nav',
  columns: [
    { key: 'key', header: 'Key' },
    { key: 'path', header: 'Path' },
    { key: 'order', header: 'Order' },
    { key: 'visible', header: 'Vis', render: (n) => <Visible value={n.visible} /> },
  ],
  Form: NavForm,
  rowKey: (n) => n.id,
};

export const SOCIAL_DEF: ResourceDef<{
  id: string; name: string; href: string; icon: string; order: number; visible: boolean;
}, SocialInput> = {
  key: 'social',
  title: 'Redes',
  apiPath: '/social',
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'href', header: 'Href', render: (s) => <span className="text-mute">{s.href}</span> },
    { key: 'icon', header: 'Icon' },
    { key: 'order', header: 'Order' },
    { key: 'visible', header: 'Vis', render: (s) => <Visible value={s.visible} /> },
  ],
  Form: SocialForm,
  rowKey: (s) => s.id,
};

/** All list-backed (non-singleton) resources editable by admin + user. */
export const COLLECTION_DEFS = [PROJECT_DEF, JOB_DEF, NAV_DEF, SOCIAL_DEF] as const;