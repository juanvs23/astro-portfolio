import type { AppConfig } from '../config.js';
import { UserModel, type UserRole } from '../models/user.js';
import { hashPassword } from './auth.js';

/**
 * Upserts the initial admin user from env (`ADMIN_EMAIL`/`ADMIN_PASSWORD`).
 * If a user already exists with that email, their role is promoted to admin
 * and their password is reset to the seeded value (so a fresh deploy always
 * has a known admin credential). Idempotent.
 */
export async function ensureAdmin(cfg: AppConfig): Promise<{
  userId: string;
  email: string;
  role: UserRole;
}> {
  const { email, password } = cfg.adminSeed;
  const passwordHash = await hashPassword(password);

  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { $set: { passwordHash, role: 'admin' as UserRole } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return {
    userId: user!._id.toString(),
    email: user!.email,
    role: user!.role as UserRole,
  };
}