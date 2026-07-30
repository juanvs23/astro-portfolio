import { describe, it, expect } from 'vitest';
import { computeQuote, buildWhatsAppMessage } from './quote-calculator';

// ---------------------------------------------------------------------------
// 9-path pricing matrix (tasks.md 2.1)
// ---------------------------------------------------------------------------
const PRICING_PATHS = [
  // chatbot-rag
  { iaType: 'chatbot-rag', urgency: 'relaxed', min: 300, max: 400 },
  { iaType: 'chatbot-rag', urgency: 'normal', min: 400, max: 500 },
  { iaType: 'chatbot-rag', urgency: 'urgent', min: 500, max: 600 },
  // autonomous-agents
  { iaType: 'autonomous-agents', urgency: 'relaxed', min: 600, max: 800 },
  { iaType: 'autonomous-agents', urgency: 'normal', min: 800, max: 1000 },
  { iaType: 'autonomous-agents', urgency: 'urgent', min: 1000, max: 1200 },
  // full-automation
  { iaType: 'full-automation', urgency: 'relaxed', min: 1200, max: 1600 },
  { iaType: 'full-automation', urgency: 'normal', min: 1600, max: 2000 },
  { iaType: 'full-automation', urgency: 'urgent', min: 2000, max: 2500 },
] as const;

// ---------------------------------------------------------------------------
// computeQuote
// ---------------------------------------------------------------------------
describe('computeQuote', () => {
  describe('valid inputs — 9-path pricing matrix', () => {
    for (const { iaType, urgency, min, max } of PRICING_PATHS) {
      it(`${iaType} × ${urgency} → { min: ${min}, max: ${max} }`, () => {
        const result = computeQuote(iaType, urgency);
        expect(result).toEqual({ min, max });
      });
    }
  });

  describe('return shape', () => {
    it('should return an object with numeric min and max', () => {
      const result = computeQuote('chatbot-rag', 'normal');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('max');
      expect(typeof result.min).toBe('number');
      expect(typeof result.max).toBe('number');
    });

    it('should have min <= max for every valid combination', () => {
      for (const { iaType, urgency } of PRICING_PATHS) {
        const { min, max } = computeQuote(iaType, urgency);
        expect(min).toBeLessThanOrEqual(max);
      }
    });

    it('should have min > 0 for every valid combination', () => {
      for (const { iaType, urgency } of PRICING_PATHS) {
        const { min } = computeQuote(iaType, urgency);
        expect(min).toBeGreaterThan(0);
      }
    });
  });

  describe('edge cases — invalid inputs', () => {
    it('should throw for unknown iaType', () => {
      expect(() => computeQuote('invalid-type', 'normal')).toThrow();
    });

    it('should throw for unknown urgency', () => {
      expect(() => computeQuote('chatbot-rag', 'tomorrow')).toThrow();
    });

    it('should throw for empty string iaType', () => {
      expect(() => computeQuote('', 'normal')).toThrow();
    });

    it('should throw for empty string urgency', () => {
      expect(() => computeQuote('chatbot-rag', '')).toThrow();
    });
  });

  describe('urgency ordering', () => {
    it('should produce higher prices for urgent than relaxed for same type', () => {
      const relaxed = computeQuote('chatbot-rag', 'relaxed');
      const urgent = computeQuote('chatbot-rag', 'urgent');
      expect(urgent.min).toBeGreaterThan(relaxed.min);
      expect(urgent.max).toBeGreaterThan(relaxed.max);
    });

    it('should produce higher prices for higher-tier iaType at same urgency', () => {
      const basic = computeQuote('chatbot-rag', 'normal');
      const mid = computeQuote('autonomous-agents', 'normal');
      const high = computeQuote('full-automation', 'normal');
      expect(mid.min).toBeGreaterThan(basic.min);
      expect(high.min).toBeGreaterThan(mid.min);
    });
  });
});

// ---------------------------------------------------------------------------
// buildWhatsAppMessage
// ---------------------------------------------------------------------------
describe('buildWhatsAppMessage', () => {
  const phone = '584248310009';

  it('should return a valid WhatsApp URL', () => {
    const url = buildWhatsAppMessage('chatbot-rag', 'relaxed', 300, 400);
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });

  it('should include the correct phone number', () => {
    const url = buildWhatsAppMessage('chatbot-rag', 'relaxed', 300, 400);
    expect(url).toContain('wa.me/584248310009');
  });

  it('should include the iaType label in the encoded message (Spanish)', () => {
    const url = buildWhatsAppMessage('autonomous-agents', 'normal', 800, 1000);
    // Spanish label: "Agentes Autónomos"
    expect(url).toContain('Agentes%20Aut%C3%B3nomos');
  });

  it('should include the urgency label in the encoded message (Spanish)', () => {
    const url = buildWhatsAppMessage('chatbot-rag', 'urgent', 500, 600);
    // Spanish label: "Urgente"
    expect(url).toContain('Urgente');
  });

  it('should include the price range in the encoded message', () => {
    const url = buildWhatsAppMessage('full-automation', 'normal', 1600, 2000);
    expect(url).toContain('1600');
    expect(url).toContain('2000');
  });

  it('should encode spaces and special characters', () => {
    const url = buildWhatsAppMessage('chatbot-rag', 'relaxed', 300, 400);
    // The message contains spaces — URL should be encoded
    expect(url).toContain('%20');
  });

  it('should produce different URLs for different inputs', () => {
    const url1 = buildWhatsAppMessage('chatbot-rag', 'relaxed', 300, 400);
    const url2 = buildWhatsAppMessage('full-automation', 'urgent', 2000, 2500);
    expect(url1).not.toBe(url2);
  });

  it('should include the greeting "Hola Juan" in the message', () => {
    const url = buildWhatsAppMessage('chatbot-rag', 'relaxed', 300, 400);
    expect(url).toContain('Hola%20Juan');
  });

  it('should mention "USD" and the range in the message', () => {
    const url = buildWhatsAppMessage('chatbot-rag', 'relaxed', 300, 400);
    expect(url).toContain('USD');
    expect(url).toContain('300');
    expect(url).toContain('400');
  });
});
