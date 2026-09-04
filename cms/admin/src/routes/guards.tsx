import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../lib/types';

/** Full-screen placeholder while the stored refresh token is being rotated. */
function Restoring() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-mute">
      <span className="animate-pulse">Restoring session…</span>
    </div>
  );
}

/** Requires a valid session; otherwise redirects to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'authenticating') return <Restoring />;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Requires an authenticated session whose role is in `roles`. Role mismatch
 * redirects to the dashboard (the safe default) rather than the login page.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}