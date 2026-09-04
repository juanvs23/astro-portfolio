import { handle } from 'hono/vercel';
import { createApp } from './app.js';

/**
 * Vercel serverless entry. The adapter (`handle`) is built into the `hono`
 * package via the `hono/vercel` subpath — there is no separate `@hono/vercel`
 * npm package (see design deviation note). The bare `app` is exported so the
 * full app also remains testable / mountable directly.
 */
export const app = createApp();

// ESLint not configured in this package; export used by the Vercel adapter.
export const GET = handle(app);
export const POST = handle(app);