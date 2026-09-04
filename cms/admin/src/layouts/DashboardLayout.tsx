import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { COLLECTION_DEFS } from '../lib/resources';

const NAV_ITEMS = [
  ...COLLECTION_DEFS.map((d) => ({ to: `/dashboard/cms/${d.key}`, label: d.title })),
  { to: '/dashboard/cms/site-info', label: 'Info del sitio' },
];

/** App shell: sidebar with the editable sections + signed-in identity + logout. */
export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-hairline bg-surface-soft">
        <div className="border-b border-hairline px-4 py-4">
          <div className="font-semibold">backoffice</div>
          <div className="mt-1 truncate text-xs text-mute" title={user?.email}>{user?.email}</div>
          <div className="text-[10px] uppercase tracking-wider text-ash">{user?.role}</div>
        </div>
        <nav className="py-2">
          <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
            Dashboard
          </NavLink>
          {NAV_ITEMS.map((i) => (
            <NavLink key={i.to} to={i.to} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              {i.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/dashboard/cms/users" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Usuarios
            </NavLink>
          )}
        </nav>
        <div className="border-t border-hairline p-4">
          <button onClick={signOut} className="text-sm text-mute hover:text-danger">[logout]</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}