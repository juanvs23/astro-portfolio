import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UsersPage } from './UsersPage';
import { AuthContext } from '../auth/AuthContext';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status: number, code?: string) {
      super(message);
      this.status = status;
      this.code = code;
    }
  },
}));

const apiMock = vi.mocked(api);

function renderUsers() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <AuthContext.Provider
      value={{
        user: { id: 'u1', email: 'admin@cms.local', role: 'admin' },
        status: 'authenticated',
        login: vi.fn(async () => {}),
        logout: vi.fn(async () => {}),
      }}
    >
      <QueryClientProvider client={qc}>
        <UsersPage />
      </QueryClientProvider>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  apiMock.mockReset();
  apiMock.mockResolvedValue({
    users: [
      { id: 'u1', email: 'admin@cms.local', role: 'admin', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'u2', email: 'writer@cms.local', role: 'user', createdAt: '2026-02-01T00:00:00Z' },
    ],
  });
});

describe('UsersPage (task 3.6 admin UI)', () => {
  it('lists users with their current roles', async () => {
    renderUsers();
    expect(await screen.findByText('admin@cms.local')).toBeInTheDocument();
    expect(screen.getByText('writer@cms.local')).toBeInTheDocument();
    expect(apiMock).toHaveBeenCalledWith('/admin/users');
  });

  it('creates a new user via POST', async () => {
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText('writer@cms.local');

    const form = screen.getByLabelText('create user form');
    await user.type(within(form).getByLabelText('Email'), 'editor@cms.local');
    await user.type(within(form).getByLabelText('Password'), 'editor-pass-1');
    await user.selectOptions(within(form).getByLabelText('Role'), 'admin');
    await user.click(within(form).getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        '/admin/users',
        expect.objectContaining({
          method: 'POST',
          body: { email: 'editor@cms.local', password: 'editor-pass-1', role: 'admin' },
        }),
      );
    });
  });

  it('changes a user role via PATCH when the select changes', async () => {
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText('writer@cms.local');

    await user.selectOptions(screen.getByLabelText('role for writer@cms.local'), 'admin');

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        '/admin/users/u2/role',
        expect.objectContaining({ method: 'PATCH', body: { role: 'admin' } }),
      );
    });
  });
});