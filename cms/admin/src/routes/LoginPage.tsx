import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/** Admin login screen. On success the AuthProvider marks the session
 *  authenticated and the caller navigates to the dashboard. */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="w-full max-w-sm panel px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold">Backoffice</h1>
        <p className="mb-6 text-xs text-mute">cms · sign in</p>

        <form onSubmit={onSubmit} className="space-y-4" aria-label="login form">
          <div>
            <label htmlFor="email" className="label mb-1">Email</label>
            <input
              id="email"
              className="field-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label mb-1">Password</label>
            <input
              id="password"
              className="field-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-danger">{error}</p>
          )}

          <button type="submit" className="btn btn-primary w-full justify-center" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}