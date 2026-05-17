import { defineMiddleware } from 'astro:middleware';
import { getLocaleFromPath, type Locale } from '@/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const locale = getLocaleFromPath(context.url.pathname) as Locale;
  (context.locals as any).locale = locale;
  return next();
});
