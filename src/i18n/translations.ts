import type { Locale } from './utils';

type TranslationValue = string | number | boolean | unknown[] | TranslationObject;
type TranslationObject = { [key: string]: TranslationValue };

let translationsCache: Record<Locale, TranslationObject> = {} as Record<Locale, TranslationObject>;

async function loadTranslations(locale: Locale): Promise<TranslationObject> {
  if (translationsCache[locale]) {
    return translationsCache[locale];
  }

  try {
    const module = await import(`../../messages/${locale}.json`);
    translationsCache[locale] = module.default;
    return module.default;
  } catch {
    if (locale !== 'es') {
      return loadTranslations('es');
    }
    return {};
  }
}

function getNestedValue(obj: TranslationObject, path: string): TranslationValue {
  const keys = path.split('.');
  let current: TranslationValue = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as TranslationObject)[key];
    } else {
      return path;
    }
  }

  return current;
}

export async function getTranslations(locale: Locale) {
  const translations = await loadTranslations(locale);

  return function t(path: string): TranslationValue {
    const value = getNestedValue(translations, path);
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return value;
  };
}

export async function getFullTranslations(locale: Locale): Promise<TranslationObject> {
  return loadTranslations(locale);
}
