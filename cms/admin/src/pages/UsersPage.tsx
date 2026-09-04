import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AdminUser, Role } from '../lib/types';
import { useAuth } from '../auth/AuthContext';

/**
 * User management (admin-only route). Lists users and allows creating users,
 * changing roles and resetting passwords via the admin API.
 */
export function UsersPage() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const { data, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => api<{ users: AdminUser[] }>('/admin/users').then((r) => r.users),
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createUser(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/admin/users', { method: 'POST', body: { email, password, role } });
      setEmail('');
      setPassword('');
      setRole('user');
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(id: string, newRole: Role) {
    setError(null);
    try {
      await api(`/admin/users/${id}/role`, { method: 'PATCH', body: { role: newRole } });
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Role update failed');
    }
  }

  async function resetPassword(id: string) {
    const next = window.prompt('New password (min 8 characters)');
    if (!next) return;
    setError(null);
    try {
      await api(`/admin/users/${id}/reset-password`, { method: 'POST', body: { password: next } });
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    }
  }

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">Usuarios</h1>
      {error && <p role="alert" className="mb-4 text-xs text-danger">{error}</p>}

      <div className="panel mb-6 max-w-xl p-4">
        <p className="mb-4 text-xs uppercase tracking-wider text-mute">create user</p>
        <form onSubmit={createUser} className="space-y-3" aria-label="create user form">
          <div>
            <label htmlFor="email" className="label mb-1">Email</label>
            <input id="email" className="field-input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="label mb-1">Password</label>
            <input id="password" className="field-input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div>
            <label htmlFor="role" className="label mb-1">Role</label>
            <select id="role" className="field-input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create user'}
          </button>
        </form>
      </div>

      <div className="panel overflow-x-auto">
        {isLoading && <p className="p-4 text-sm text-mute">Loading…</p>}
        {!isLoading && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="th">Email</th>
                <th className="th">Role</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="td">
                    {u.email} {u.id === me?.id && <span className="text-[10px] uppercase text-ash">(you)</span>}
                  </td>
                  <td className="td">
                    <select
                      aria-label={`role for ${u.email}`}
                      className="field-input w-auto"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as Role)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="td text-right">
                    <button className="text-xs text-accent" onClick={() => resetPassword(u.id)}>
                      reset password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}