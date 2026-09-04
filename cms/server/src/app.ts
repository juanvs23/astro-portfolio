import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { loadConfig, type AppConfig } from './config.js';
import { errorHandler } from './middleware/error.js';
import { authRoutes } from './routes/auth.js';

export interface CreateAppOptions {
  config?: AppConfig;
}

/**
 * Builds the backoffice-cms API application.
 *
 * All routes live under the `/api/v1` prefix. This slice exposes the health
 * endpoint, the restricted CORS allow-list and the auth module
 * (`/api/v1/auth/*`). Later slices (content-api, admin) mount additional
 * routers here.
 */
export function createApp(opts: CreateAppOptions = {}): Hono {
  const config = opts.config ?? loadConfig();

  const app = new Hono().basePath('/api/v1');

  app.onError(errorHandler);

  // Strict CORS: only origins listed in CORS_ORIGINS receive cross-origin
  // headers. A disallowed origin gets no CORS response headers.
  app.use(
    '*',
    cors({
      origin: (origin) =>
        config.corsOrigins.includes(origin) ? origin : undefined,
    }),
  );

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.route('/auth', authRoutes(config));

  return app;
}