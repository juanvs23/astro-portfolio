import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const webhookUrl = import.meta.env.PUBLIC_N8N_LEAD_WEBHOOK;

    if (!webhookUrl) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (import.meta.env.N8N_AUTH_USER && import.meta.env.N8N_AUTH_PASS) {
      headers['Authorization'] = 'Basic ' + Buffer.from(
        import.meta.env.N8N_AUTH_USER + ':' + import.meta.env.N8N_AUTH_PASS
      ).toString('base64');
    }

    // Fire-and-forget to n8n — don't block on its response
    fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }).catch(() => { /* n8n down, lead still captured via WhatsApp */ });

    // Always return success — the lead is captured via WhatsApp
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (_err) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
};
