import type { APIRoute } from 'astro';
import { buildSitemapEntries, renderSitemapXml } from '../lib/seo/sitemap';

/** Fallback used only when the `site` config is unavailable (spec seo-sitemap). */
const FALLBACK_SITE_URL = 'https://coltmandev.dev';

function getLastModified(): string {
  return new Date().toISOString().split('T')[0];
}

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL(FALLBACK_SITE_URL);
  const sitemap = renderSitemapXml(buildSitemapEntries(baseUrl, getLastModified()));

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
