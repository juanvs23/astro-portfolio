import { describe, it, expect } from 'vitest';
import { siteInfo, type FaqItemLd } from '../../constants';
import {
  buildPersonLd,
  buildProfessionalServiceLd,
  buildFaqPageLd,
  serializeJsonLd,
} from './jsonld';

// ---------------------------------------------------------------------------
// seo-complete-review PR 1 (1.4): pure JSON-LD builders for Person,
// ProfessionalService and FAQPage, plus the serializer. Expected shapes come
// from spec `seo-jsonld` (Requirement: Typed, pure, testable builders) and
// design.md AD-3/AD-6 (serializer escapes `<`, builders are deterministic).
// ---------------------------------------------------------------------------

const SITE_URL = new URL('https://coltmandev.dev');

const FAQ: FaqItemLd[] = [
  { question: '¿Cuánto cuesta un proyecto?', answer: 'Depende del alcance.' },
  { question: '¿En cuánto tiempo entregan?', answer: 'Una landing en 3 días.' },
  { question: '¿La auditoría tiene algún costo?', answer: 'No, es gratuita.' },
];

describe('buildPersonLd', () => {
  it('should emit a Person node with identity, image/logo and the 4 sameAs URLs', () => {
    const person = buildPersonLd();
    expect(person['@type']).toBe('Person');
    expect(person['@context']).toBe('https://schema.org');
    expect(person.name).toBe(siteInfo.name);
    expect(person.jobTitle).toBe(siteInfo.jobTitle);
    expect(person.url).toBe(siteInfo.url);
    expect(person.telephone).toBe(siteInfo.telephone);
    expect(person.image).toBe(siteInfo.logo);
    expect(person.logo).toBe(siteInfo.logo);
    expect(person.sameAs).toEqual(siteInfo.sameAs);
    expect(person.sameAs).toHaveLength(4);
  });
});

describe('buildProfessionalServiceLd', () => {
  it('should emit a ProfessionalService node referencing the person by @id', () => {
    const service = buildProfessionalServiceLd();
    expect(service['@type']).toBe('ProfessionalService');
    expect(service['@context']).toBe('https://schema.org');
    expect(service.founder).toEqual({ '@id': `${siteInfo.url}/#person` });
    expect(service.url).toBe(siteInfo.url);
    expect(service.name).toBe(siteInfo.name);
  });
});

describe('buildFaqPageLd', () => {
  it('should map every faq item verbatim into Question/Answer mainEntity pairs', () => {
    const faqPage = buildFaqPageLd(FAQ, SITE_URL);
    expect(faqPage).not.toBeNull();
    expect(faqPage!['@type']).toBe('FAQPage');
    expect(faqPage!['@context']).toBe('https://schema.org');
    const entities = faqPage!.mainEntity as unknown[];
    expect(entities).toHaveLength(3);
    expect(entities[0]).toEqual({
      '@type': 'Question',
      name: '¿Cuánto cuesta un proyecto?',
      acceptedAnswer: { '@type': 'Answer', text: 'Depende del alcance.' },
    });
  });

  it('should be deterministic — same inputs produce deep-equal output', () => {
    expect(buildFaqPageLd(FAQ, SITE_URL)).toEqual(buildFaqPageLd(FAQ, SITE_URL));
  });

  it('should return null when the faq array is empty', () => {
    expect(buildFaqPageLd([], SITE_URL)).toBeNull();
  });
});

describe('serializeJsonLd', () => {
  it('should escape < as \\u003c so script tags cannot break out of the block', () => {
    const payload = {
      '@context': 'https://schema.org' as const,
      '@type': 'Thing',
      name: '</script><b>hi</b>',
    };
    const [json] = serializeJsonLd(payload);
    expect(json).not.toContain('</script>');
    expect(json).not.toContain('<');
    expect(json).toContain('\\u003c/script');
    expect(JSON.parse(json).name).toBe('</script><b>hi</b>');
  });

  it('should return one JSON string per object when given an array', () => {
    const output = serializeJsonLd([buildPersonLd(), buildProfessionalServiceLd()]);
    expect(output).toHaveLength(2);
    expect(JSON.parse(output[0])['@type']).toBe('Person');
    expect(JSON.parse(output[1])['@type']).toBe('ProfessionalService');
  });

  it('should return an empty array for a zero-object input', () => {
    expect(serializeJsonLd([])).toEqual([]);
  });
});
