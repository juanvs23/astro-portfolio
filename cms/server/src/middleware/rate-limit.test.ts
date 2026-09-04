import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { AppConfig } from '../config.js';
import { consumeLoginAttempt, loginRateLimitGuard, rateLimitKey } from './rate-limit.js';
import { RateLimitModel } from '../models/rate-limit.js';
import { startTestMongo, stopTestMongo, clearDb } from '../test/db.js';

const cfg: AppConfig = {
  jwtSecret: 's',
  accessTokenTtlSec: 900,
  refreshTokenTtlSec: 2592000,
  mongoUri: 'x',
  corsOrigins: [],
  adminSeed: { email: 'a@b.c', password: 'p' },
  rateLimit: { windowMs: 60_000, max: 3 },
};

beforeAll(async () => {
  await startTestMongo();
});
afterAll(async () => {
  await stopTestMongo();
});
beforeEach(async () => {
  await clearDb();
});

describe('rateLimitKey (task 1.6, pure)', () => {
  it('combines normalised email and ip deterministically', () => {
    expect(rateLimitKey('Admin@CMS.local', '1.2.3.4')).toBe('admin@cms.local|1.2.3.4');
    expect(rateLimitKey('a@b.c', '1.2.3.4')).not.toBe(rateLimitKey('a@b.c', '9.9.9.9'));
  });
});

describe('consumeLoginAttempt (task 1.6)', () => {
  it('allows attempts while under the limit and reports remaining', async () => {
    for (let i = 1; i <= 3; i += 1) {
      const r = await consumeLoginAttempt('a@b.c|1.2.3.4', cfg);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(3 - i);
    }
  });

  it('denies once the limit is exceeded (429 boundary)', async () => {
    for (let i = 0; i < 3; i += 1) await consumeLoginAttempt('a@b.c|1.2.3.4', cfg);
    const over = await consumeLoginAttempt('a@b.c|1.2.3.4', cfg);
    expect(over.allowed).toBe(false);
  });

  it('counts per email+ip key independently', async () => {
    for (let i = 0; i < 3; i += 1) await consumeLoginAttempt('a@b.c|1.1.1.1', cfg);
    const other = await consumeLoginAttempt('a@b.c|2.2.2.2', cfg);
    expect(other.allowed).toBe(true);
    expect(other.remaining).toBe(2);
  });
});

describe('loginRateLimitGuard (task 1.6)', () => {
  it('throws HttpError 429 when the limit is exceeded', async () => {
    for (let i = 0; i < 3; i += 1) await consumeLoginAttempt('a@b.c|1.2.3.4', cfg);
    await expect(loginRateLimitGuard('a@b.c', '1.2.3.4', cfg)).rejects.toMatchObject({ status: 429 });
  });

  it('does not throw while under the limit', async () => {
    await expect(loginRateLimitGuard('a@b.c', '1.2.3.4', cfg)).resolves.toBeUndefined();
  });

  it('persists a TTL-indexed counter doc per window', async () => {
    await consumeLoginAttempt('a@b.c|1.2.3.4', cfg);
    const doc = await RateLimitModel.findOne({ key: 'a@b.c|1.2.3.4' });
    expect(doc).not.toBeNull();
    expect(doc!.count).toBe(1);
    expect(doc!.resetAt.getTime()).toBeGreaterThan(Date.now());
  });
});