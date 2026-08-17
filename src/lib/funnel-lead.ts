import type { ContactFormData } from './contact-form';

export interface FunnelLeadInput {
  name: string;
  email: string;
}

export interface FunnelLeadMessages {
  nameRequired: string;
  emailInvalid: string;
}

export interface FunnelLeadResult {
  valid: boolean;
  errors?: Record<string, string>;
  data?: ContactFormData;
}

export type FunnelContext = 'audit' | 'contact';

export interface FunnelPayloadCopy {
  subject: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Neutral fallback copy (es baseline) used when the caller does not pass
// localized strings. Callers override with `t('funnel.audit.subject')` etc.
const DEFAULT_FUNNEL_COPY: Record<FunnelContext, FunnelPayloadCopy> = {
  audit: {
    subject: 'Auditoría gratuita',
    message: 'Quiero una auditoría gratuita para mi negocio.',
  },
  contact: {
    subject: 'Nuevo contacto',
    message: 'Quiero ponerme en contacto.',
  },
};

/**
 * Validates a funnel lead (name + email). Returns `{ valid: false, errors }`
 * keyed by field (`name` | `email`) when invalid, or `{ valid: true }` when
 * the lead passes. Trims input before checking.
 */
export function validateLead(
  input: FunnelLeadInput,
  messages: FunnelLeadMessages,
): FunnelLeadResult {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  const email = input.email.trim();

  if (!name) {
    errors.name = messages.nameRequired;
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    errors.email = messages.emailInvalid;
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}

/**
 * Synthesizes the full `ContactFormData` required by `submitContactForm` from
 * the short funnel form (name + email only). The funnel forms have no phone
 * field, so `phone` is blanked (D4). Subject/message come from the given copy
 * (resolved from `funnel.audit.*` / `funnel.contact.*` by the caller) so the
 * module stays pure and localized.
 */
export function buildFunnelContactPayload(
  input: FunnelLeadInput,
  context: FunnelContext,
  copy?: FunnelPayloadCopy,
): ContactFormData {
  const resolved = copy ?? DEFAULT_FUNNEL_COPY[context];
  return {
    name: input.name.trim(),
    phone: '',
    email: input.email.trim(),
    subject: resolved.subject,
    message: resolved.message,
  };
}

/**
 * Builds a WhatsApp `wa.me` deep-link with the text prefilled and encoded.
 * `https://wa.me/{number}?text={encodeURIComponent(text)}`
 */
export function buildWhatsAppLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}