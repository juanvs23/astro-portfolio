import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { AppConfig } from '../config.js';
import { ensureAdmin } from './seed.js';
import { UserModel } from '../models/user.js';
import { hashPassword, verifyPassword } from './auth.js';
import { startTestMongo, stopTestMongo, clearDb } from '../test/db.js';

const cfg: AppConfig = {
  jwtSecret: 's',
  accessTokenTtlSec: 900,
  refreshTokenTtlSec: 2592000,
  mongoUri: 'x',
  corsOrigins: [],
  adminSeed: { email: 'root@cms.local', password: 'root-password' },
  rateLimit: { windowMs: 900000, max: 10 },
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

describe('ensureAdmin (task 1.3 seed)', () => {
  it('creates the admin user from env seed when absent', async () => {
    const admin = await ensureAdmin(cfg);
    expect(admin.email).toBe('root@cms.local');
    expect(admin.role).toBe('admin');

    const stored = await UserModel.findOne({ email: 'root@cms.local' });
    expect(stored).not.toBeNull();
    expect(await verifyPassword('root-password', stored!.passwordHash)).toBe(true);
  });

  it('upserts an existing user to admin role with the seeded password', async () => {
    await UserModel.create({
      email: 'root@cms.local',
      passwordHash: await hashPassword('old-pass'),
      role: 'user',
    });

    const admin = await ensureAdmin(cfg);
    expect(admin.role).toBe('admin');

    const stored = await UserModel.findOne({ email: 'root@cms.local' });
    expect(stored!.role).toBe('admin');
    expect(await verifyPassword('root-password', stored!.passwordHash)).toBe(true);
  });

  it('is idempotent — running twice keeps a single admin', async () => {
    await ensureAdmin(cfg);
    await ensureAdmin(cfg);
    expect(await UserModel.countDocuments({ email: 'root@cms.local' })).toBe(1);
  });
});