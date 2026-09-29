/**
 * WhatsApp contact number — resolved from the `PUBLIC_WHATSAPP_NUMBER`
 * environment variable (set in Vercel) with a hardcoded fallback so the site
 * never ships an empty `wa.me` link in local/dev or when the variable is
 * unset. The number is config, not translatable content, so it no longer
 * lives in `messages/{es,en}.json`.
 *
 * The value must be the international E.164 digits WITHOUT the leading `+`
 * or any separators (e.g. `584121825673`), which is what `wa.me` expects.
 */
const FALLBACK_NUMBER = '584121825673';

export function getWhatsAppNumber(): string {
  const fromEnv = import.meta.env.PUBLIC_WHATSAPP_NUMBER as string | undefined;
  return fromEnv && fromEnv.trim() !== '' ? fromEnv.trim() : FALLBACK_NUMBER;
}