import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { RoleSchema } from '@cms/contracts';
import { requireRole, type Variables } from '../middleware/auth.js';
import { UserModel } from '../models/index.js';
import { hashPassword } from '../services/auth.js';
import { HttpError, notFound } from '../errors.js';

type AdminEnv = { Variables: Variables };

/** Create-user input: email + password + optional role (defaults to `user`). */
const CreateUserInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: RoleSchema.default('user'),
});
const SetRoleInput = z.object({ role: RoleSchema });
const ResetPasswordInput = z.object({ password: z.string().min(8) });

export interface UserPublic {
  id: string;
  email: string;
  role: string;
  createdAt: string | null;
}

/** Maps a persisted user doc to the public shape (never exposes passwordHash). */
export function toUserPublic(doc: {
  _id: { toString(): string };
  email: string;
  role: string;
  createdAt?: Date | string | null;
}): UserPublic {
  return {
    id: doc._id.toString(),
    email: doc.email,
    role: doc.role,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

/**
 * User management API mounted at `/api/v1/admin/users` (admin-only). The
 * parent admin router already applies `requireAuth`; each route further
 * requires the `admin` role.
 */
export function usersRoutes(): Hono<AdminEnv> {
  const users = new Hono<AdminEnv>();

  users.get('/', requireRole('admin'), async (c) => {
    const docs = await UserModel.find({}).sort({ createdAt: 1 }).lean();
    return c.json({ users: docs.map(toUserPublic) });
  });

  users.post('/', requireRole('admin'), zValidator('json', CreateUserInput), async (c) => {
    const { email, password, role } = c.req.valid('json');
    const normalizedEmail = email.toLowerCase().trim();
    if (await UserModel.exists({ email: normalizedEmail })) {
      throw new HttpError(409, 'A user with that email already exists', 'email_taken');
    }
    const doc = await UserModel.create({
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role,
    });
    return c.json({ user: toUserPublic(doc) }, 201);
  });

  users.patch('/:id/role', requireRole('admin'), zValidator('json', SetRoleInput), async (c) => {
    const { role } = c.req.valid('json');
    const doc = await UserModel.findByIdAndUpdate(
      c.req.param('id'),
      { $set: { role } },
      { new: true, runValidators: true },
    );
    if (!doc) throw notFound('User not found');
    return c.json({ user: toUserPublic(doc) });
  });

  users.post(
    '/:id/reset-password',
    requireRole('admin'),
    zValidator('json', ResetPasswordInput),
    async (c) => {
      const { password } = c.req.valid('json');
      const doc = await UserModel.findById(c.req.param('id'));
      if (!doc) throw notFound('User not found');
      doc.passwordHash = await hashPassword(password);
      await doc.save();
      return c.json({ ok: true });
    },
  );

  return users;
}