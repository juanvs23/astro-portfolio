export type Locale = 'es' | 'en';

export const locales: Locale[] = ['es', 'en'];

export const defaultLocale: Locale = 'en';

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as Locale;
  if (locales.includes(firstSegment)) {
    return firstSegment;
  }
  return defaultLocale;
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as Locale;
  if (locales.includes(firstSegment)) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

export function getLocalizedPathname(pathname: string, locale: Locale): string {
  const cleanPath = getPathWithoutLocale(pathname);
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}
