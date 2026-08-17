import type { Locale } from './utils';

export type TranslationValue = string | number | boolean | unknown[] | TranslationObject;
export type TranslationObject = { [key: string]: TranslationValue };

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

export interface Translator {
  (path: string): string;
  /** Structured accessor: returns the raw nested value (object/array/primitive). */
  object(path: string): TranslationValue;
}

export async function getTranslations(locale: Locale): Promise<Translator> {
  const translations = await loadTranslations(locale);

  const t = ((path: string): string => {
    return String(getNestedValue(translations, path));
  }) as Translator;
  t.object = (path: string): TranslationValue => getNestedValue(translations, path);
  return t;
}

export async function getFullTranslations(locale: Locale): Promise<TranslationObject> {
  return loadTranslations(locale);
}
