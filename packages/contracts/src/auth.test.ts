import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  LoginInputSchema,
  RoleSchema,
  AuthUserSchema,
  TokenPayloadSchema,
  type LoginInput,
  type AuthUser,
  type TokenPayload,
  type Role,
} from './auth.js';

describe('LoginInputSchema', () => {
  it('parses a valid email + password', () => {
    const result = LoginInputSchema.safeParse({ email: 'admin@coltmandev.dev', password: 's3cret' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@coltmandev.dev');
      expect(result.data.password).toBe('s3cret');
    }
  });

  it('rejects an invalid email', () => {
    const result = LoginInputSchema.safeParse({ email: 'not-an-email', password: 's3cret' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('email');
    }
  });

  it('rejects an empty password', () => {
    const result = LoginInputSchema.safeParse({ email: 'admin@coltmandev.dev', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('RoleSchema', () => {
  it('accepts only admin and user roles', () => {
    expect(RoleSchema.safeParse('admin').success).toBe(true);
    expect(RoleSchema.safeParse('user').success).toBe(true);
    expect(RoleSchema.safeParse('superuser').success).toBe(false);
  });

  it('infers a Role union of admin | user', () => {
    expectTypeOf<Role>().toEqualTypeOf<'admin' | 'user'>();
  });
});

describe('AuthUserSchema', () => {
  it('parses a valid admin user', () => {
    const result = AuthUserSchema.safeParse({ id: 'u_01', email: 'admin@coltmandev.dev', role: 'admin' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('admin');
      expect(result.data.id).toBe('u_01');
    }
  });

  it('rejects an invalid role', () => {
    const result = AuthUserSchema.safeParse({ id: 'u_01', email: 'admin@coltmandev.dev', role: 'owner' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = AuthUserSchema.safeParse({ id: 'u_01', email: 'nope', role: 'user' });
    expect(result.success).toBe(false);
  });
});

describe('TokenPayloadSchema', () => {
  it('parses a valid access-token payload', () => {
    const result = TokenPayloadSchema.safeParse({
      sub: 'u_01',
      email: 'admin@coltmandev.dev',
      role: 'admin',
      exp: 1770000000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sub).toBe('u_01');
      expect(result.data.exp).toBe(1770000000);
    }
  });

  it('rejects a payload missing the role claim', () => {
    const result = TokenPayloadSchema.safeParse({ sub: 'u_01', email: 'admin@coltmandev.dev', exp: 1770000000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('role');
    }
  });

  it('rejects a non-positive exp', () => {
    const result = TokenPayloadSchema.safeParse({
      sub: 'u_01',
      email: 'admin@coltmandev.dev',
      role: 'user',
      exp: -5,
    });
    expect(result.success).toBe(false);
  });

  it('infers LoginInput, AuthUser and TokenPayload types from their schemas', () => {
    const login = LoginInputSchema.parse({ email: 'admin@coltmandev.dev', password: 'x' });
    const user = AuthUserSchema.parse({ id: 'u_01', email: 'admin@coltmandev.dev', role: 'admin' });
    const token = TokenPayloadSchema.parse({
      sub: 'u_01',
      email: 'admin@coltmandev.dev',
      role: 'admin',
      exp: 1770000000,
    });
    expectTypeOf(login).toEqualTypeOf<LoginInput>();
    expectTypeOf(user).toEqualTypeOf<AuthUser>();
    expectTypeOf(token).toEqualTypeOf<TokenPayload>();
  });
});