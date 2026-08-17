import { describe, it, expect } from 'vitest';
import { getTranslations } from '../i18n';
import {
  validateLead,
  buildFunnelContactPayload,
  buildWhatsAppLink,
} from './funnel-lead';
import type { FunnelLeadInput, FunnelLeadMessages } from './funnel-lead';
import type { ContactFormData } from './contact-form';

// ---------------------------------------------------------------------------
// PR₂ (home-funnel-landing): pure lead-capture helpers
// ---------------------------------------------------------------------------

const VALIDATION_MESSAGES: FunnelLeadMessages = {
  nameRequired: 'Por favor, escriba su nombre',
  emailInvalid: 'El email no es válido',
};

const VALID_INPUT: FunnelLeadInput = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
};

describe('validateLead', () => {
  it('should mark a name + valid email as valid with no errors', () => {
    const result = validateLead(VALID_INPUT, VALIDATION_MESSAGES);
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should trim surrounding whitespace from name and email before validating', () => {
    const result = validateLead(
      { name: '  Ana Pérez  ', email: '  ana@example.com  ' },
      VALIDATION_MESSAGES,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it.each(['', 'ana', 'ana@', 'ana@example', '@example.com', 'ana @example.com'])(
    'should reject malformed email "%s" without posting (errors.email set)',
    (email) => {
      const result = validateLead({ name: 'Ana Pérez', email }, VALIDATION_MESSAGES);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.email).toBe(VALIDATION_MESSAGES.emailInvalid);
      expect(result.errors?.name).toBeUndefined();
    },
  );

  it('should reject an empty name with errors.name set to the required copy', () => {
    const result = validateLead({ name: '   ', email: 'ana@example.com' }, VALIDATION_MESSAGES);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.name).toBe(VALIDATION_MESSAGES.nameRequired);
    expect(result.errors?.email).toBeUndefined();
  });

  it('should report both errors when name and email are both empty', () => {
    const result = validateLead({ name: '', email: '' }, VALIDATION_MESSAGES);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.name).toBe(VALIDATION_MESSAGES.nameRequired);
    expect(result.errors?.email).toBe(VALIDATION_MESSAGES.emailInvalid);
  });
});

describe('buildFunnelContactPayload', () => {
  const AUDIT_COPY = { subject: 'Auditoría gratuita', message: 'Quiero una auditoría gratuita para mi negocio.' };

  it('should synthesize a full ContactFormData payload with blank phone and audit copy', () => {
    const payload = buildFunnelContactPayload(VALID_INPUT, 'audit', AUDIT_COPY);
    expect(payload).toEqual({
      name: 'Ana Pérez',
      phone: '',
      email: 'ana@example.com',
      subject: AUDIT_COPY.subject,
      message: AUDIT_COPY.message,
    } satisfies ContactFormData);
  });

  it('should trim name and email when building the payload', () => {
    const payload = buildFunnelContactPayload(
      { name: '  Ana Pérez  ', email: '  ana@example.com  ' },
      'audit',
      AUDIT_COPY,
    );
    expect(payload.name).toBe('Ana Pérez');
    expect(payload.email).toBe('ana@example.com');
  });

  it('should use the copy for the contact context instead of the audit copy', () => {
    const contactCopy = { subject: 'Nuevo contacto', message: 'Quiero ponerme en contacto.' };
    const payload = buildFunnelContactPayload(VALID_INPUT, 'contact', contactCopy);
    expect(payload.subject).toBe(contactCopy.subject);
    expect(payload.message).toBe(contactCopy.message);
    expect(payload.phone).toBe('');
  });

  it('should resolve funnel.audit.subject/message from es translations and honor them', async () => {
    const t = await getTranslations('es');
    const subject = t('funnel.audit.subject') as string;
    const message = t('funnel.audit.message') as string;
    expect(subject).toBe('Auditoría gratuita');
    expect(message).toBe('Quiero una auditoría gratuita para mi negocio.');

    const payload = buildFunnelContactPayload(VALID_INPUT, 'audit', { subject, message });
    expect(payload).toEqual({
      name: 'Ana Pérez',
      phone: '',
      email: 'ana@example.com',
      subject,
      message,
    } satisfies ContactFormData);
  });
});

describe('buildWhatsAppLink', () => {
  it('should build a wa.me deep-link encoding the text and keeping the number', () => {
    const link = buildWhatsAppLink('584248310009', 'Quiero una auditoría gratuita para mi negocio.');
    expect(link).toBe(
      'https://wa.me/584248310009?text=Quiero%20una%20auditor%C3%ADa%20gratuita%20para%20mi%20negocio.',
    );
  });

  it('should encode spaces, accents, question marks and keep exclamation marks', () => {
    const link = buildWhatsAppLink('59811234567', 'Hola! ¿Planes? Cotización');
    expect(link).toBe('https://wa.me/59811234567?text=Hola!%20%C2%BFPlanes%3F%20Cotizaci%C3%B3n');
  });

  it('should still produce a valid link when the text is empty', () => {
    expect(buildWhatsAppLink('584248310009', '')).toBe('https://wa.me/584248310009?text=');
  });

  it('should use contact.whatsappNumber as the number source with funnel audit message copy', async () => {
    const t = await getTranslations('es');
    const number = t('contact.whatsappNumber') as string;
    const text = t('funnel.audit.message') as string;
    const link = buildWhatsAppLink(number, text);
    expect(link).toBe(`https://wa.me/584248310009?text=${encodeURIComponent(text)}`);
    expect(link.startsWith('https://wa.me/584248310009?text=')).toBe(true);
  });
});
