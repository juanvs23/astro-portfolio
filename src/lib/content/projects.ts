import { wpProjectsSchema, mapProject, type Project } from './schema';

/**
 * Build-time projects data layer (wordpress-headless Phase 2).
 *
 *   WP API (PUBLIC_WP_API_URL, default Coltman projects WP)
 *     -> Zod validation -> mapProject -> filter (visible && site) -> sort
 *
 * Resilience contract: when the WP API is unreachable, answers non-200, or
 * returns schema-invalid data, the layer warns LOUDLY and degrades to the
 * committed snapshot (`src/data/snapshot/projects.json`, generated from the
 * live API) validated with the SAME schema. If the snapshot also fails, it
 * throws a loud error: the build must not silently render an empty page.
 */

export const DEFAULT_WP_API_URL =
  'https://projects.coltmandev.dev/porfolio/wp-json/wp/v2/portafolio';

const WP_QUERY = '?_embed&orderby=menu_order&order=asc&per_page=100';

const SNAPSHOT_FALLBACK_WARN =
  '[projects] WP API unreachable/invalid — falling back to committed snapshot';

export type ProjectSite = 'portfolio' | 'sales';

/** Minimal structural shape of a fetch Response consumed by this layer. */
interface FetchLike {
  (url: string): Promise<{
    ok: boolean;
    status: number;
    json: () => Promise<unknown>;
  }>;
}

export interface GetProjectsDeps {
  /** Fetch used to hit the WP API. Defaults to the global fetch. */
  fetch?: FetchLike;
  /** Loads the committed snapshot payload. Defaults to the dynamic JSON import. */
  loadSnapshot?: () => Promise<unknown>;
}

function resolveApiUrl(): string {
  const fromEnv = import.meta.env.PUBLIC_WP_API_URL as string | undefined;
  const base =
    fromEnv && fromEnv.trim() !== '' ? fromEnv.trim() : DEFAULT_WP_API_URL;
  return `${base}${WP_QUERY}`;
}

async function defaultLoadSnapshot(): Promise<unknown> {
  const mod = (await import('@/data/snapshot/projects.json')) as {
    default: unknown;
  };
  return mod.default;
}

/** Raw validated + mapped list — cached per build so two sections never double-fetch. */
let allProjectsCache: Promise<Project[]> | null = null;

/** Reset the module-level cache (test isolation / fresh rebuild). */
export function resetProjectsCache(): void {
  allProjectsCache = null;
}

function parseAndMap(payload: unknown, source: string): Project[] {
  const parsed = wpProjectsSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(
      `${source} payload failed Zod validation: ${parsed.error.issues
        .slice(0, 3)
        .map((issue) => `${issue.path.join('.') || '(root)'} ${issue.message}`)
        .join('; ')}`,
    );
  }
  return parsed.data.map(mapProject);
}

async function loadAllProjects(deps: GetProjectsDeps): Promise<Project[]> {
  const doFetch = deps.fetch ?? fetch;
  const loadSnapshot = deps.loadSnapshot ?? defaultLoadSnapshot;

  try {
    const response = await doFetch(resolveApiUrl());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return parseAndMap(await response.json(), 'WP API');
  } catch (wpError) {
    const wpReason = wpError instanceof Error ? wpError.message : String(wpError);
    console.warn(`${SNAPSHOT_FALLBACK_WARN} (reason: ${wpReason})`);
    try {
      return parseAndMap(await loadSnapshot(), 'Committed snapshot');
    } catch (snapshotError) {
      const snapshotReason =
        snapshotError instanceof Error ? snapshotError.message : String(snapshotError);
      throw new Error(
        `[projects] WP API unreachable/invalid AND the committed snapshot failed — ` +
          `projects cannot be rendered. WP reason: ${wpReason}. Snapshot reason: ${snapshotReason}.`,
      );
    }
  }
}

function cacheAllProjects(deps: GetProjectsDeps): Promise<Project[]> {
  // Cache the promise (not the result) so concurrent section calls during
  // prerender share one fetch. A failure clears the cache before rethrowing.
  if (!allProjectsCache) {
    allProjectsCache = loadAllProjects(deps).catch((error: unknown) => {
      allProjectsCache = null;
      throw error;
    });
  }
  return allProjectsCache;
}

/**
 * All projects for a site, sorted by WP menu order.
 * Keeps visible projects whose `showOn` matches the site or is `'both'`.
 */
export async function getProjects(
  site: ProjectSite,
  deps: GetProjectsDeps = {},
): Promise<Project[]> {
  const all = await cacheAllProjects(deps);
  return all
    .filter((p) => p.visible && (p.showOn === site || p.showOn === 'both'))
    .sort((a, b) => a.order - b.order);
}
