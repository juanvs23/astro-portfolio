import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUpload } from './ImageUpload';
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

function file(name = 'photo.png'): File {
  return new File(['x'.repeat(32)], name, { type: 'image/png' });
}

beforeEach(() => {
  apiMock.mockReset();
});

describe('ImageUpload (task 3.6 upload UI)', () => {
  it('uploads a file to /admin/upload and reports the returned URL', async () => {
    apiMock.mockResolvedValue({ url: 'https://blob.vercel-storage.com/cms/1-photo.png' });
    const onChange = vi.fn();
    render(<ImageUpload value="" onChange={onChange} />);

    await userEvent.upload(screen.getByLabelText('Image upload'), file());
    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        '/admin/upload',
        expect.objectContaining({ method: 'POST' }),
      );
    });
    // ImageUpload is controlled: it reports the uploaded URL to the parent
    // via onChange (rendering the value is the parent's responsibility).
    expect(onChange).toHaveBeenCalledWith('https://blob.vercel-storage.com/cms/1-photo.png');
  });

  it('shows the current URL and a clear button when a value exists', () => {
    const onChange = vi.fn();
    render(<ImageUpload value="https://x.dev/a.png" onChange={onChange} />);
    expect(screen.getByText('https://x.dev/a.png')).toBeInTheDocument();
  });

  it('surfaces an upload error', async () => {
    apiMock.mockRejectedValue(Object.assign(new Error('Blob not configured'), { status: 503 }));
    render(<ImageUpload value="" onChange={vi.fn()} />);

    await userEvent.upload(screen.getByLabelText('Image upload'), file());
    expect(await screen.findByText(/Blob not configured/i)).toBeInTheDocument();
  });
});