import { describe, it, expect, beforeEach } from 'vitest';
import {
  setAccessToken,
  getAccessToken,
  persistSession,
  getStoredRefreshToken,
  clearSession,
  hasRefreshToken,
  decodeAccessToken,
  type SessionUser,
} from './tokenStore';

const refreshKey = 'cms.refresh';

beforeEach(() => {
  localStorage.clear();
  // Reset in-memory access token between tests.
  setAccessToken(null);
});

describe('tokenStore (task 3.2 session persistence)', () => {
  it('keeps the access token in memory only (not localStorage)', () => {
    setAccessToken('mem-token');
    expect(getAccessToken()).toBe('mem-token');
    expect(localStorage.getItem('cms.access')).toBeNull();
  });

  it('persists the refresh token to localStorage and reads it back', () => {
    expect(getStoredRefreshToken()).toBeNull();
    persistSession({ accessToken: 'acc', refreshToken: 'ref' });
    expect(getStoredRefreshToken()).toBe('ref');
    expect(localStorage.getItem(refreshKey)).toBe('ref');
    expect(hasRefreshToken()).toBe(true);
  });

  it('clearSession wipes both the memory access token and stored refresh token', () => {
    persistSession({ accessToken: 'acc', refreshToken: 'ref' });
    clearSession();
    expect(getAccessToken()).toBeNull();
    expect(getStoredRefreshToken()).toBeNull();
    expect(localStorage.getItem(refreshKey)).toBeNull();
  });
});

describe('decodeAccessToken', () => {
  function makeToken(payload: Record<string, unknown>): string {
    const enc = (obj: Record<string, unknown>) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `header.${enc(payload)}.sig`;
  }

  it('decodes sub/email/role from a valid access token', () => {
    const token = makeToken({ sub: 'u1', email: 'a@b.dev', role: 'admin', exp: 9999 });
    const user = decodeAccessToken(token) as SessionUser;
    expect(user.id).toBe('u1');
    expect(user.email).toBe('a@b.dev');
    expect(user.role).toBe('admin');
  });

  it('returns null for a malformed token', () => {
    expect(decodeAccessToken('not-a-jwt')).toBeNull();
    expect(decodeAccessToken('a..b')).toBeNull();
    expect(decodeAccessToken('x.%%%.z')).toBeNull();
  });
});