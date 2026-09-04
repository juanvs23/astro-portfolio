import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../auth/AuthContext';
import { RequireAuth, RequireRole } from './guards';
import type { SessionUser } from '../lib/tokenStore';

const adminUser: SessionUser = { id: 'u1', email: 'admin@cms.local', role: 'admin' };
const userUser: SessionUser = { id: 'u2', email: 'user@cms.local', role: 'user' };

function ctx(over: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    status: 'unauthenticated',
    login: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
    ...over,
  };
}

function renderAtSecret(value: AuthContextValue, element: React.ReactNode) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route path="/login" element={<div>LoginPage</div>} />
          <Route path="/dashboard" element={<div>DashboardPage</div>} />
          <Route path="/secret" element={element} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('RequireAuth (task 3.3)', () => {
  it('redirects an unauthenticated user to /login', () => {
    renderAtSecret(ctx({ status: 'unauthenticated' }), <RequireAuth><div>Secret</div></RequireAuth>);
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('shows a session-restoring state while authenticating', () => {
    renderAtSecret(ctx({ status: 'authenticating' }), <RequireAuth><div>Secret</div></RequireAuth>);
    expect(screen.getByText(/Restoring session/i)).toBeInTheDocument();
  });

  it('renders children for an authenticated user', () => {
    renderAtSecret(ctx({ user: userUser, status: 'authenticated' }), <RequireAuth><div>Secret</div></RequireAuth>);
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});

describe('RequireRole (task 3.3)', () => {
  it('allows an admin through an admin-only route', () => {
    renderAtSecret(
      ctx({ user: adminUser, status: 'authenticated' }),
      <RequireRole roles={['admin']}><div>AdminZone</div></RequireRole>,
    );
    expect(screen.getByText('AdminZone')).toBeInTheDocument();
  });

  it('redirects a user-role member away from an admin-only route', () => {
    renderAtSecret(
      ctx({ user: userUser, status: 'authenticated' }),
      <RequireRole roles={['admin']}><div>AdminZone</div></RequireRole>,
    );
    expect(screen.getByText('DashboardPage')).toBeInTheDocument();
    expect(screen.queryByText('AdminZone')).not.toBeInTheDocument();
  });

  it('allows a user-role member through a content route (roles admin+user)', () => {
    renderAtSecret(
      ctx({ user: userUser, status: 'authenticated' }),
      <RequireRole roles={['admin', 'user']}><div>ContentZone</div></RequireRole>,
    );
    expect(screen.getByText('ContentZone')).toBeInTheDocument();
  });
});