import type { APIRoute } from 'astro';

const SITE_URL = 'https://coltmandev.dev';
const LOCALES = ['es', 'en'];
const PAGES = ['', '/about', '/skills', '/experience', '/projects', '/contact'];

function getLastModified(): string {
  return new Date().toISOString().split('T')[0];
}

export const GET: APIRoute = () => {
  const urls = LOCALES.flatMap((locale) =>
    PAGES.map((page) => {
      const path = page ? `/${locale}${page}` : `/${locale}`;
      return `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${getLastModified()}</lastmod>
    <changefreq>${page === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    }),
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
