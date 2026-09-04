import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { LoginInputSchema } from '@cms/contracts';
import type { AppConfig } from '../config.js';
import {
  requireValidCredentials,
  issueTokenPair,
  rotateTokenPair,
  revokeRefreshToken,
} from '../services/auth.js';
import { loginRateLimitGuard, clientIp } from '../middleware/rate-limit.js';

const RefreshInputSchema = z.object({
  refreshToken: z.string().min(1),
});

/**
 * Auth routes: login / refresh / logout mounted at `/api/v1/auth/*`.
 * Tokens are returned in the JSON body so the admin SPA can store them and
 * attach the access token as a Bearer header (see design deviation note).
 */
export function authRoutes(cfg: AppConfig): Hono {
  const auth = new Hono();

  auth.post('/login', zValidator('json', LoginInputSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    await loginRateLimitGuard(email, clientIp(c), cfg);
    const user = await requireValidCredentials(email, password);
    const pair = await issueTokenPair(user, cfg);
    return c.json(
      { accessToken: pair.accessToken, refreshToken: pair.refreshToken },
      200,
    );
  });

  auth.post('/refresh', zValidator('json', RefreshInputSchema), async (c) => {
    const { refreshToken } = c.req.valid('json');
    const pair = await rotateTokenPair(refreshToken, cfg);
    return c.json(
      { accessToken: pair.accessToken, refreshToken: pair.refreshToken },
      200,
    );
  });

  auth.post('/logout', zValidator('json', RefreshInputSchema), async (c) => {
    const { refreshToken } = c.req.valid('json');
    await revokeRefreshToken(refreshToken);
    return c.json({ ok: true }, 200);
  });

  return auth;
}