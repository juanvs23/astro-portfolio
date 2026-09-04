import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AnyResourceDef } from '../lib/resources';
import type { AdminResource } from '../lib/types';

/**
 * Generic CRUD page for a list-backed resource (projects, jobs, nav, social).
 * Lists all docs (incl. invisible), and offers create / edit / delete via the
 * resource's form. Reads and writes go through the authenticated API.
 */
export function ResourcePage({ def }: { def: AnyResourceDef }) {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<AdminResource[]>({
    queryKey: ['admin', def.apiPath],
    queryFn: () => api<AdminResource[]>(`/admin${def.apiPath}`),
  });

  const [editing, setEditing] = useState<AdminResource | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(value: unknown) {
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        await api(`/admin${def.apiPath}/${editing.id}`, { method: 'PUT', body: value });
      } else {
        await api(`/admin${def.apiPath}`, { method: 'POST', body: value });
      }
      await qc.invalidateQueries({ queryKey: ['admin', def.apiPath] });
      setEditing(null);
      setCreating(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setError(null);
    try {
      await api(`/admin${def.apiPath}/${id}`, { method: 'DELETE' });
      await qc.invalidateQueries({ queryKey: ['admin', def.apiPath] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  const Form = def.Form;
  const showForm = creating || editing !== null;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{def.title}</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          [+ new {def.key.slice(0, -1)}]
        </button>
      </div>

      {error && <p role="alert" className="mb-4 text-xs text-danger">{error}</p>}

      {showForm ? (
        <div className="panel mb-6 p-4">
          <p className="mb-4 text-xs uppercase tracking-wider text-mute">
            {editing ? `edit ${def.key}` : `create ${def.key}`}
          </p>
          <Form
            initial={editing ?? undefined}
            onSubmit={save}
            busy={busy}
            submitLabel={editing ? 'Update' : 'Create'}
          />
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          {isLoading && <p className="p-4 text-sm text-mute">Loading…</p>}
          {isError && <p className="p-4 text-sm text-danger">Could not load {def.key}.</p>}
          {!isLoading && !isError && (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {def.columns.map((c) => (
                    <th key={c.key} className="th">{c.header}</th>
                  ))}
                  <th className="th" aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((item) => (
                  <tr key={def.rowKey(item)}>
                    {def.columns.map((c) => (
                      <td key={c.key} className="td">
                        {c.render ? c.render(item) : String(item[c.key as keyof AdminResource] ?? '')}
                      </td>
                    ))}
                    <td className="td text-right">
                      <button className="mr-2 text-xs text-accent" onClick={() => { setCreating(false); setEditing(item); }}>
                        edit
                      </button>
                      <button className="text-xs text-danger" onClick={() => remove(item.id)}>
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}