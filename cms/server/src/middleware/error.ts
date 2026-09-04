import type { Context } from 'hono';
import { HttpError } from '../errors.js';

/**
 * Unified JSON error handler. Renders `HttpError` with its status/code and
 * collapses any unexpected error into a 500 without leaking internals.
 */
export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof HttpError) {
    return c.json(
      { error: { code: err.code ?? 'http_error', message: err.message } },
      err.status,
    );
  }
  // eslint-disable-next-line no-console
  console.error('[server] unhandled error:', err);
  return c.json(
    { error: { code: 'internal_error', message: 'Internal server error' } },
    500,
  );
}