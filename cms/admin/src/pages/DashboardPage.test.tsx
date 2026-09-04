import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from './DashboardPage';
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

function renderDashboard() {
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
        <DashboardPage />
      </QueryClientProvider>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  apiMock.mockReset();
});

describe('DashboardPage (task 3.4)', () => {
  it('shows the signed-in identity and per-resource counts', async () => {
    apiMock.mockImplementation(async (path: string) => {
      if (path === '/admin/projects') return [{}, {}, {}]; // 3 projects
      if (path === '/admin/jobs') return [{}]; // 1 job
      return []; // nav / social empty
    });

    renderDashboard();

    expect(screen.getByText('admin@cms.local')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('count-projects').textContent).toBe('3'));
    await waitFor(() => expect(screen.getByTestId('count-jobs').textContent).toBe('1'));
    await waitFor(() => expect(screen.getByTestId('count-nav').textContent).toBe('0'));
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
    expect(screen.getByText('Experiencia')).toBeInTheDocument();
  });
});