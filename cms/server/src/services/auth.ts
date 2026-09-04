import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'node:crypto';
import type { Role } from '@cms/contracts';
import { UserModel } from '../models/user.js';
import { RefreshTokenModel } from '../models/refresh-token.js';
import { HttpError, unauthorized } from '../errors.js';
import type { AppConfig } from '../config.js';

export interface AuthUserContext {
  userId: string;
  email: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  familyId: string;
}

// --- Pure helpers (deterministic, unit-testable) ---------------------------

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** SHA-256 hex digest — used to store only hashes of refresh tokens. */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Cryptographically-random opaque refresh token value. */
export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

export function signAccessToken(
  secret: string,
  user: { sub: string; email: string; role: Role },
  ttlSec: number,
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(key);
}

export async function verifyAccessToken(
  secret: string,
  token: string,
): Promise<{ sub: string; email: string; role: Role; exp: number }> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: payload.role as Role,
    exp: payload.exp as number,
  };
}

// --- DB-backed token lifecycle ---------------------------------------------

/** Issues a fresh access+refresh pair for an authenticated user. */
export async function issueTokenPair(
  user: AuthUserContext,
  cfg: AppConfig,
): Promise<TokenPair> {
  const familyId = generateRefreshToken();
  const refreshToken = generateRefreshToken();

  await RefreshTokenModel.create({
    tokenHash: sha256(refreshToken),
    familyId,
    userId: user.userId,
    expiresAt: new Date(Date.now() + cfg.refreshTokenTtlSec * 1000),
  });

  const accessToken = await signAccessToken(
    cfg.jwtSecret,
    { sub: user.userId, email: user.email, role: user.role },
    cfg.accessTokenTtlSec,
  );

  return { accessToken, refreshToken, familyId };
}

/**
 * Rotates a refresh token: marks the presented token `used`, issues a new
 * token in the same family, and returns a fresh access token.
 * Reusing a `used` token is treated as token theft and revokes the whole
 * family (replay-revoke).
 */
export async function rotateTokenPair(
  rawRefresh: string,
  cfg: AppConfig,
): Promise<TokenPair> {
  const doc = await RefreshTokenModel.findOne({ tokenHash: sha256(rawRefresh) });
  if (!doc) throw unauthorized('Invalid refresh token');

  if (doc.revoked) throw unauthorized('Refresh token is revoked');
  if (doc.expiresAt.getTime() <= Date.now()) {
    await doc.deleteOne();
    throw unauthorized('Refresh token expired');
  }
  if (doc.used) {
    // Replay detected — burn the entire family.
    await RefreshTokenModel.updateMany(
      { familyId: doc.familyId },
      { $set: { revoked: true } },
    );
    throw unauthorized('Refresh token reuse detected — family revoked');
  }

  const user = await UserModel.findById(doc.userId);
  if (!user) throw unauthorized('Invalid refresh token');

  doc.used = true;
  await doc.save();

  const newRefresh = generateRefreshToken();
  await RefreshTokenModel.create({
    tokenHash: sha256(newRefresh),
    familyId: doc.familyId,
    userId: doc.userId,
    expiresAt: new Date(Date.now() + cfg.refreshTokenTtlSec * 1000),
  });

  const accessToken = await signAccessToken(
    cfg.jwtSecret,
    { sub: user._id.toString(), email: user.email, role: user.role },
    cfg.accessTokenTtlSec,
  );

  return { accessToken, refreshToken: newRefresh, familyId: doc.familyId };
}

/** Revokes the presented refresh token (logout). Idempotent. */
export async function revokeRefreshToken(rawRefresh: string): Promise<void> {
  const doc = await RefreshTokenModel.findOne({ tokenHash: sha256(rawRefresh) });
  if (!doc) return;
  if (!doc.revoked) {
    doc.revoked = true;
    await doc.save();
  }
}

/** Verifies credentials against the stored user; null on failure. */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUserContext | null> {
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { userId: user._id.toString(), email: user.email, role: user.role };
}

/** Throws HttpError with a consistent message when credentials are invalid. */
export async function requireValidCredentials(
  email: string,
  password: string,
): Promise<AuthUserContext> {
  const user = await authenticateUser(email, password);
  if (!user) throw new HttpError(401, 'Invalid credentials', 'invalid_credentials');
  return user;
}