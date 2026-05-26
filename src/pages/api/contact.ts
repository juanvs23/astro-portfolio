import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || '';
const FROM_EMAIL = import.meta.env.FROM_EMAIL || '';
const TO_EMAIL = import.meta.env.TO_EMAIL || '';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_API_KEY || !FROM_EMAIL || !TO_EMAIL) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const resend = new Resend(RESEND_API_KEY);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { name, phone, email, subject, message } = body as Record<string, string>;

  if (!name || !email || !subject || !message) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: name, email, subject, message' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!isValidEmail(email)) {
    return new Response(
      JSON.stringify({ error: 'Invalid email address' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    await resend.emails.send({
      from: `${name} <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      replyTo: email,
      subject: `Portfolio: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
