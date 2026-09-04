import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { errorHandler } from './error.js';
import { HttpError, badRequest, unauthorized, forbidden, tooManyRequests } from '../errors.js';

function buildApp(): Hono {
  const app = new Hono();
  app.onError(errorHandler);
  app.get('/throw', (c) => {
    throw new Error('boom');
  });
  app.get('/bad', () => {
    throw badRequest('nope');
  });
  app.get('/unauth', () => {
    throw unauthorized('no token');
  });
  app.get('/forbidden', () => {
    throw forbidden('nope role');
  });
  app.get('/limit', () => {
    throw tooManyRequests('slow down');
  });
  return app;
}

describe('errorHandler (task 1.8)', () => {
  it('maps HttpError 400 to JSON with code and message', async () => {
    const res = await buildApp().request('/bad');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: { code: 'bad_request', message: 'nope' },
    });
  });

  it('maps HttpError 401 to JSON', async () => {
    const res = await buildApp().request('/unauth');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: { code: 'unauthorized', message: 'no token' },
    });
  });

  it('maps HttpError 403 to JSON', async () => {
    const res = await buildApp().request('/forbidden');
    expect(res.status).toBe(403);
  });

  it('maps HttpError 429 to JSON', async () => {
    const res = await buildApp().request('/limit');
    expect(res.status).toBe(429);
  });

  it('maps an unknown error to 500 internal_error', async () => {
    const res = await buildApp().request('/throw');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('internal_error');
  });

  it('supports arbitrary HttpError status/code via constructor', async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get('/custom', () => {
      throw new HttpError(418, 'teapot', 'i_am_a_teapot');
    });
    const res = await app.request('/custom');
    expect(res.status).toBe(418);
    expect(await res.json()).toEqual({
      error: { code: 'i_am_a_teapot', message: 'teapot' },
    });
  });
});