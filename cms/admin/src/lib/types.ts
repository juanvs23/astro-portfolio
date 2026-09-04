/** Authorization roles, mirroring the shared `@cms/contracts` Role schema. */
export type Role = 'admin' | 'user';

/** Minimal shape returned by the admin API for any persisted resource. */
export interface AdminResource {
  id: string;
  [key: string]: unknown;
}

/** User document returned by `/admin/users`. */
export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  createdAt: string | null;
}