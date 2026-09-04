import { z } from 'zod';

/** Credentials accepted by `POST /api/v1/admin/auth/login`. */
export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Authorization roles. `admin` owns all admin routes; `user` owns content writes. */
export const RoleSchema = z.enum(['admin', 'user']);

/** Authenticated user document returned to admin clients. */
export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: RoleSchema,
});

/** Claims carried by the short-lived JWT access token (jose HS256). */
export const TokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  exp: z.number().int().positive(),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type TokenPayload = z.infer<typeof TokenPayloadSchema>;