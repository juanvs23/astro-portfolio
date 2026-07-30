// ---------------------------------------------------------------------------
// Quote Calculator — pure functions for IA project pricing
// Tasks: 2.1 — PRICING_MATRIX, computeQuote, buildWhatsAppMessage
// ---------------------------------------------------------------------------

export type IaType = 'chatbot-rag' | 'autonomous-agents' | 'full-automation';
export type Urgency = 'relaxed' | 'normal' | 'urgent';

export interface Quote {
  min: number;
  max: number;
}

// 9-path pricing matrix (3 IA types × 3 urgencies)
type PricingKey = `${IaType}:${Urgency}`;

const PRICING_MATRIX: Record<PricingKey, Quote> = {
  'chatbot-rag:relaxed': { min: 300, max: 400 },
  'chatbot-rag:normal': { min: 400, max: 500 },
  'chatbot-rag:urgent': { min: 500, max: 600 },
  'autonomous-agents:relaxed': { min: 600, max: 800 },
  'autonomous-agents:normal': { min: 800, max: 1000 },
  'autonomous-agents:urgent': { min: 1000, max: 1200 },
  'full-automation:relaxed': { min: 1200, max: 1600 },
  'full-automation:normal': { min: 1600, max: 2000 },
  'full-automation:urgent': { min: 2000, max: 2500 },
};

const VALID_IA_TYPES: ReadonlySet<string> = new Set([
  'chatbot-rag',
  'autonomous-agents',
  'full-automation',
]);

const VALID_URGENCIES: ReadonlySet<string> = new Set([
  'relaxed',
  'normal',
  'urgent',
]);

/**
 * Compute an estimated price range for an IA project.
 * Throws on invalid inputs.
 */
export function computeQuote(iaType: string, urgency: string): Quote {
  if (!iaType || !VALID_IA_TYPES.has(iaType)) {
    throw new Error(
      `Invalid iaType: "${iaType}". Must be one of: ${[...VALID_IA_TYPES].join(', ')}`,
    );
  }
  if (!urgency || !VALID_URGENCIES.has(urgency)) {
    throw new Error(
      `Invalid urgency: "${urgency}". Must be one of: ${[...VALID_URGENCIES].join(', ')}`,
    );
  }
  const key = `${iaType}:${urgency}` as PricingKey;
  return { ...PRICING_MATRIX[key] };
}

const IA_TYPE_LABELS: Record<string, string> = {
  'chatbot-rag': 'Chatbot con RAG',
  'autonomous-agents': 'Agentes Autónomos',
  'full-automation': 'Automatización Completa',
};

const URGENCY_LABELS: Record<string, string> = {
  relaxed: 'Relajado',
  normal: 'Normal',
  urgent: 'Urgente',
};

/**
 * Build a WhatsApp pre-filled message URL.
 * Message format (Spanish):
 *   "Hola Juan! Me interesa un proyecto de IA: [tipo]. Urgencia: [urgencia].
 *    Mi estimado fue USD [min]-[max]. Contame más."
 */
export function buildWhatsAppMessage(
  iaType: string,
  urgency: string,
  min: number,
  max: number,
): string {
  const phone = '584248310009';
  const typeLabel = IA_TYPE_LABELS[iaType] ?? iaType;
  const urgencyLabel = URGENCY_LABELS[urgency] ?? urgency;
  const message =
    `Hola Juan! Me interesa un proyecto de IA: ${typeLabel}. ` +
    `Urgencia: ${urgencyLabel}. ` +
    `Mi estimado fue USD ${min}-${max}. Contame más.`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}
