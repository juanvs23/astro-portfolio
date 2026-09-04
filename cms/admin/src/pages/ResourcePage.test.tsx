import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResourcePage } from './ResourcePage';
import { PROJECT_DEF, type AnyResourceDef } from '../lib/resources';
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

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ResourcePage def={PROJECT_DEF as unknown as AnyResourceDef} />
    </QueryClientProvider>,
  );
}

const projects = [
  { id: 'p1', name: 'Gericht', url: 'https://restaurant.dev', desc_es: 'x', desc_en: 'y', imageUrl: 'gericht', order: 1, visible: true },
  { id: 'p2', name: 'Hidden', url: 'https://hidden.dev', desc_es: 'x', desc_en: 'y', imageUrl: '', order: 2, visible: false },
];

beforeEach(() => {
  apiMock.mockReset();
  apiMock.mockResolvedValue(projects);
});

describe('ResourcePage (task 3.5 CRUD UI)', () => {
  it('lists all projects including invisible ones', async () => {
    renderPage();
    expect(await screen.findByText('Gericht')).toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
    expect(apiMock).toHaveBeenCalledWith('/admin/projects');
  });

  it('creates a project via POST from the new form', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Gericht');

    await user.click(screen.getByRole('button', { name: /\+ new project/i }));
    const form = await screen.findByLabelText('project form');
    await user.type(within(form).getByLabelText('Name'), 'New Site');
    await user.type(within(form).getByLabelText('URL'), 'https://newsite.dev');
    await user.click(within(form).getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        '/admin/projects',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({ name: 'New Site', url: 'https://newsite.dev' }),
        }),
      );
    });
  });

  it('edits an existing project via PUT with prefilled values', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Gericht');

    const row = screen.getByText('Gericht').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: 'edit' }));

    const form = await screen.findByLabelText('project form');
    const nameInput = within(form).getByLabelText('Name') as HTMLInputElement;
    expect(nameInput.value).toBe('Gericht'); // prefilled from the row
    await user.clear(nameInput);
    await user.type(nameInput, 'Gericht v2');
    await user.click(within(form).getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        '/admin/projects/p1',
        expect.objectContaining({
          method: 'PUT',
          body: expect.objectContaining({ name: 'Gericht v2' }),
        }),
      );
    });
  });

  it('surfaces a save error to the user', async () => {
    apiMock
      .mockResolvedValueOnce(projects) // initial list
      .mockRejectedValueOnce(Object.assign(new Error('Role forbidden'), { status: 403 }));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Gericht');

    await user.click(screen.getByRole('button', { name: /\+ new project/i }));
    const form = await screen.findByLabelText('project form');
    await user.type(within(form).getByLabelText('Name'), 'X');
    await user.type(within(form).getByLabelText('URL'), 'https://x.dev');
    await user.click(within(form).getByRole('button', { name: 'Create' }));

    expect(await screen.findByText(/Role forbidden/i)).toBeInTheDocument();
  });
});