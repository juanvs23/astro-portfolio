import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { UserModel } from './user.js';
import { RefreshTokenModel } from './refresh-token.js';
import { RateLimitModel } from './rate-limit.js';
import { startTestMongo, stopTestMongo, clearDb } from '../test/db.js';

beforeAll(async () => {
  await startTestMongo();
});
afterAll(async () => {
  await stopTestMongo();
});
beforeEach(async () => {
  await clearDb();
});

describe('User model (task 1.3)', () => {
  it('persists email, passwordHash and role with an assigned _id', async () => {
    const user = await UserModel.create({
      email: 'admin@cms.local',
      passwordHash: 'hashed-123',
      role: 'admin',
    });
    expect(user._id).toBeDefined();
    expect(user.email).toBe('admin@cms.local');
    expect(user.role).toBe('admin');
  });

  it('normalises email to lowercase and defaults role to user', async () => {
    const user = await UserModel.create({
      email: 'MixedCase@Example.com',
      passwordHash: 'hashed-123',
    });
    expect(user.email).toBe('mixedcase@example.com');
    expect(user.role).toBe('user');
  });

  it('enforces unique email — second insert with the same email rejects', async () => {
    await UserModel.create({ email: 'dup@cms.local', passwordHash: 'a' });
    await expect(
      UserModel.create({ email: 'dup@cms.local', passwordHash: 'b' }),
    ).rejects.toThrow(/duplicate key/i);
  });

  it('rejects an invalid role value at validation time', async () => {
    await expect(
      // @ts-expect-error intentionally invalid role for validation test
      UserModel.create({ email: 'bad@cms.local', passwordHash: 'a', role: 'owner' }),
    ).rejects.toThrow(/role/i);
  });
});

describe('RefreshToken model (task 1.3)', () => {
  it('persists a token with default used=false and revoked=false', async () => {
    const user = await UserModel.create({
      email: 'u@cms.local',
      passwordHash: 'a',
    });
    const tok = await RefreshTokenModel.create({
      tokenHash: 'hash-1',
      familyId: 'fam-1',
      userId: user._id,
      expiresAt: new Date(Date.now() + 1000),
    });
    expect(tok.tokenHash).toBe('hash-1');
    expect(tok.used).toBe(false);
    expect(tok.revoked).toBe(false);
    expect(tok.expiresAt).toBeInstanceOf(Date);
  });

  it('enforces unique tokenHash', async () => {
    const user = await UserModel.create({ email: 'u2@cms.local', passwordHash: 'a' });
    await RefreshTokenModel.create({
      tokenHash: 'same',
      familyId: 'f1',
      userId: user._id,
      expiresAt: new Date(),
    });
    await expect(
      RefreshTokenModel.create({
        tokenHash: 'same',
        familyId: 'f2',
        userId: user._id,
        expiresAt: new Date(),
      }),
    ).rejects.toThrow(/duplicate key/i);
  });

  it('registers a TTL index on expiresAt for automatic expiry', async () => {
    const indexes = await RefreshTokenModel.collection.indexes();
    const ttl = indexes.find((i) => i.key.expiresAt === 1);
    expect(ttl).toBeDefined();
    expect(ttl!.expireAfterSeconds).toBe(0);
  });
});

describe('RateLimit model (task 1.3)', () => {
  it('creates a rate-limit doc with key, count and resetAt', async () => {
    const doc = await RateLimitModel.create({
      key: 'admin@cms.local|127.0.0.1',
      count: 3,
      resetAt: new Date(Date.now() + 60_000),
    });
    expect(doc.key).toBe('admin@cms.local|127.0.0.1');
    expect(doc.count).toBe(3);
    expect(doc.resetAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('registers a single-field TTL index on resetAt', async () => {
    const indexes = await RateLimitModel.collection.indexes();
    // Match the single-field {resetAt:1} index, not the {key:1,resetAt:1} unique one.
    const ttl = indexes.find(
      (i) => i.key.resetAt === 1 && Object.keys(i.key).length === 1,
    );
    expect(ttl).toBeDefined();
    expect(ttl!.expireAfterSeconds).toBe(0);
  });
});