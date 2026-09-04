import { useRef, useState } from 'react';
import { api } from '../lib/api';

/**
 * Image upload for the CMS. Picks a local file, uploads it to
 * `POST /admin/upload` (Vercel Blob, admin-only) and reports the returned
 * public URL via `onChange`. Also lets the user clear the value.
 */
export function ImageUpload({
  value,
  onChange,
  label = 'Image',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const { url } = await api<{ url: string }>('/admin/upload', {
        method: 'POST',
        formData: form,
      });
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <span className="label mb-1">{label}</span>
      <div className="mt-1 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          aria-label={`${label} upload`}
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="block text-xs text-mute file:mr-3 file:border file:border-hairline file:bg-surface-soft file:px-2 file:py-1 file:text-xs file:text-ink"
        />
        {busy && <p className="text-xs text-mute">Uploading…</p>}
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        {value && (
          <div className="flex items-center justify-between gap-2">
            <a href={value} target="_blank" rel="noreferrer" className="truncate text-xs text-accent">
              {value}
            </a>
            <button type="button" className="text-xs text-danger" onClick={() => onChange('')}>
              [clear]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}