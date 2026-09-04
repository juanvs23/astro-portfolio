import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import type { AppConfig } from '../config.js';
import {
  hashPassword,
  verifyPassword,
  sha256,
  generateRefreshToken,
  signAccessToken,
  verifyAccessToken,
  issueTokenPair,
  rotateTokenPair,
  revokeRefreshToken,
  type AuthUserContext,
} from './auth.js';
import { UserModel } from '../models/user.js';
import { RefreshTokenModel } from '../models/refresh-token.js';
import { startTestMongo, stopTestMongo, clearDb } from '../test/db.js';

const cfg: AppConfig = {
  jwtSecret: 'test-secret-0123456789',
  accessTokenTtlSec: 900,
  refreshTokenTtlSec: 2592000,
  mongoUri: 'mongodb://127.0.0.1:27017/x',
  corsOrigins: [],
  adminSeed: { email: 'admin@cms.local', password: 'admin-pass' },
  rateLimit: { windowMs: 900000, max: 10 },
};

async function makeUser(role: 'admin' | 'user' = 'user'): Promise<AuthUserContext> {
  const u = await UserModel.create({
    email: `${role}@cms.local`,
    passwordHash: await hashPassword('password-1'),
    role,
  });
  return {
    userId: u._id.toString(),
    email: u.email,
    role: u.role,
  };
}

beforeAll(async () => {
  await startTestMongo();
});
afterAll(async () => {
  await stopTestMongo();
});
beforeEach(async () => {
  await clearDb();
});

describe('password hashing (task 1.4)', () => {
  it('hashes then verifies a correct password', async () => {
    const hash = await hashPassword('s3cret!');
    expect(hash).not.toContain('s3cret!');
    expect(await verifyPassword('s3cret!', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('right');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});

describe('refresh token helpers (task 1.4)', () => {
  it('sha256 is deterministic and 64 hex chars', () => {
    expect(sha256('abc')).toBe(sha256('abc'));
    expect(sha256('abc')).toMatch(/^[0-9a-f]{64}$/);
    expect(sha256('abc')).not.toBe(sha256('abd'));
  });

  it('generateRefreshToken yields unique opaque values', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });
});

describe('access token signing (task 1.4)', () => {
  it('signs and verifies a token carrying sub, email and role', async () => {
    const token = await signAccessToken(
      cfg.jwtSecret,
      { sub: 'u1', email: 'a@cms.local', role: 'admin' },
      cfg.accessTokenTtlSec,
    );
    const payload = await verifyAccessToken(cfg.jwtSecret, token);
    expect(payload.sub).toBe('u1');
    expect(payload.email).toBe('a@cms.local');
    expect(payload.role).toBe('admin');
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signAccessToken('secret-a', { sub: 'u1', email: 'a@cms.local', role: 'user' }, 900);
    await expect(verifyAccessToken('secret-b', token)).rejects.toThrow();
  });
});

describe('token pair issuance + rotation + reuse (task 1.4)', () => {
  it('issues access + refresh and stores only the refresh hash in Mongo', async () => {
    const user = await makeUser('admin');
    const pair = await issueTokenPair(user, cfg);

    expect(pair.accessToken).toBeTruthy();
    expect(pair.refreshToken).toBeTruthy();
    expect(pair.familyId).toBeTruthy();

    const stored = await RefreshTokenModel.findOne({ tokenHash: sha256(pair.refreshToken) });
    expect(stored).not.toBeNull();
    // Plaintext refresh token is never stored.
    expect((await RefreshTokenModel.find()).some((d) => d.tokenHash === pair.refreshToken)).toBe(false);
  });

  it('rotates: marks old used, issues a new token in the same family', async () => {
    const user = await makeUser();
    const pair = await issueTokenPair(user, cfg);

    const rotated = await rotateTokenPair(pair.refreshToken, cfg);
    expect(rotated.familyId).toBe(pair.familyId);
    expect(rotated.refreshToken).not.toBe(pair.refreshToken);

    const old = await RefreshTokenModel.findOne({ tokenHash: sha256(pair.refreshToken) });
    expect(old!.used).toBe(true);
    const fresh = await RefreshTokenModel.findOne({ tokenHash: sha256(rotated.refreshToken) });
    expect(fresh!.used).toBe(false);
  });

  it('reuse of a rotated (used) token revokes the whole family', async () => {
    const user = await makeUser();
    const pair = await issueTokenPair(user, cfg);
    const rotated = await rotateTokenPair(pair.refreshToken, cfg);

    // Replaying the old (already used) token must fail AND revoke the family.
    await expect(rotateTokenPair(pair.refreshToken, cfg)).rejects.toThrow(/reuse/i);

    // The freshly issued token of the same family is now revoked too.
    await expect(rotateTokenPair(rotated.refreshToken, cfg)).rejects.toThrow(/revoked/i);
  });

  it('rejects an unknown refresh token', async () => {
    const user = await makeUser();
    await expect(rotateTokenPair(generateRefreshToken(), cfg)).rejects.toThrow(/invalid/i);
  });

  it('logout revokes the presented refresh token', async () => {
    const user = await makeUser();
    const pair = await issueTokenPair(user, cfg);
    await revokeRefreshToken(pair.refreshToken);

    await expect(rotateTokenPair(pair.refreshToken, cfg)).rejects.toThrow(/revoked/i);
    const stored = await RefreshTokenModel.findOne({ tokenHash: sha256(pair.refreshToken) });
    expect(stored!.revoked).toBe(true);
  });

  it('rejects an expired refresh token', async () => {
    const user = await makeUser();
    const pair = await issueTokenPair(user, cfg);
    await RefreshTokenModel.updateOne(
      { tokenHash: sha256(pair.refreshToken) },
      { expiresAt: new Date(Date.now() - 1000) },
    );
    await expect(rotateTokenPair(pair.refreshToken, cfg)).rejects.toThrow(/expired/i);
  });
});

describe('unknown user at refresh time', () => {
  it('rejects rotation when the owner user no longer exists', async () => {
    const user = await makeUser();
    const pair = await issueTokenPair(user, cfg);
    await UserModel.deleteOne({ _id: new Types.ObjectId(user.userId) });
    await expect(rotateTokenPair(pair.refreshToken, cfg)).rejects.toThrow(/invalid/i);
  });
});