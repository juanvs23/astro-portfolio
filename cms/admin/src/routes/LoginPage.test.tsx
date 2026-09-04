import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { LoginPage } from './LoginPage';
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

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>DashboardPage</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  apiMock.mockReset();
});

describe('LoginPage (task 3.2)', () => {
  it('renders email/password fields and a sign-in button', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits credentials to the login API and navigates to the dashboard on success', async () => {
    apiMock.mockResolvedValue({ accessToken: 'a.b.c', refreshToken: 'ref' });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@cms.local');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({ method: 'POST', body: { email: 'admin@cms.local', password: 'secret' } }),
      );
    });
    expect(await screen.findByText('DashboardPage')).toBeInTheDocument();
  });

  it('shows the server error message on invalid credentials', async () => {
    apiMock.mockRejectedValue(
      Object.assign(new Error('Invalid credentials'), { status: 401, code: 'invalid_credentials' }),
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@cms.local');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
    expect(screen.queryByText('DashboardPage')).not.toBeInTheDocument();
  });
});