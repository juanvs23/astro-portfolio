import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { LoginPage } from './routes/LoginPage';
import { RequireAuth, RequireRole } from './routes/guards';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcePage } from './pages/ResourcePage';
import { SiteInfoPage } from './pages/SiteInfoPage';
import { UsersPage } from './pages/UsersPage';
import { COLLECTION_DEFS, type AnyResourceDef } from './lib/resources';

/** Resolves `/dashboard/cms/:key` to its resource definition. */
function CollectionRoute() {
  const { key } = useParams();
  const def = COLLECTION_DEFS.find((d) => d.key === key);
  if (!def) return <Navigate to="/dashboard" replace />;
  return <ResourcePage def={def as unknown as AnyResourceDef} />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="cms/:key" element={<CollectionRoute />} />
        <Route path="cms/site-info" element={<SiteInfoPage />} />
        <Route
          path="cms/users"
          element={
            <RequireRole roles={['admin']}>
              <UsersPage />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}