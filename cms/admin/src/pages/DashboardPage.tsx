import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { COLLECTION_DEFS } from '../lib/resources';
import { useAuth } from '../auth/AuthContext';

/** Dashboard: shows the signed-in identity and per-resource content counts. */
export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Dashboard</h1>
      <p className="mb-6 text-sm text-mute">
        Signed in as <span className="text-ink">{user?.email}</span> · {user?.role}
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {COLLECTION_DEFS.map((def) => <CountCard key={def.key} def={def} />)}
      </div>
    </div>
  );
}

function CountCard({ def }: { def: { key: string; title: string; apiPath: string } }) {
  const { data } = useQuery<unknown[]>({
    queryKey: ['admin', def.apiPath],
    queryFn: () => api<unknown[]>(`/admin${def.apiPath}`),
  });
  return (
    <div className="panel p-4">
      <div className="text-2xl font-semibold" data-testid={`count-${def.key}`}>
        {data?.length ?? '–'}
      </div>
      <div className="text-xs uppercase tracking-wider text-mute">{def.title}</div>
    </div>
  );
}