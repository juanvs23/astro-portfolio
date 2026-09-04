import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { SiteInfoForm, type SiteInfoInput } from '../forms/SiteInfoForm';

/** Site-info is a single document (admin-only PUT upsert). No list — just the form. */
export function SiteInfoPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<SiteInfoInput | null>({
    queryKey: ['admin', 'site-info'],
    queryFn: () => api<SiteInfoInput | null>('/admin/site-info'),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(v: SiteInfoInput) {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await api('/admin/site-info', { method: 'PUT', body: v });
      await qc.invalidateQueries({ queryKey: ['admin', 'site-info'] });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">Info del sitio</h1>
      {error && <p role="alert" className="mb-4 text-xs text-danger">{error}</p>}
      {saved && <p role="status" className="mb-4 text-xs text-success">Saved ✓</p>}
      {isLoading ? (
        <p className="text-sm text-mute">Loading…</p>
      ) : (
        <div className="panel max-w-2xl p-4">
          <SiteInfoForm initial={data ?? undefined} onSubmit={save} busy={busy} />
        </div>
      )}
    </div>
  );
}