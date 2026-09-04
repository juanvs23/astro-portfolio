import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './routes/LoginPage';
import { RequireAuth } from './routes/guards';

/** Root router. Authentication wiring is added here; content CRUD routes are
 *  layered on in the dashboard layout (auth-gated). */
export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="*"
        element={
          <RequireAuth>
            <DashboardPlaceholder />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function DashboardPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-mute">
      authenticated — dashboard coming next
    </div>
  );
}