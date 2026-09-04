import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  refreshSession,
} from '../lib/api';
import {
  persistSession,
  clearSession,
  decodeAccessToken,
  getStoredRefreshToken,
  hasRefreshToken,
  type SessionUser,
} from '../lib/tokenStore';

export type AuthStatus = 'authenticating' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: SessionUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Owns the session: on boot it silently restores a session from a stored
 * refresh token (via `/auth/refresh`); `login` stores the token pair and
 * decodes the user; `logout` revokes the refresh token server-side and
 * clears local session state.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('authenticating');

  useEffect(() => {
    let active = true;
    (async () => {
      if (!hasRefreshToken()) {
        setStatus('unauthenticated');
        return;
      }
      try {
        const token = await refreshSession();
        if (!active) return;
        const decoded = decodeAccessToken(token);
        setUser(decoded);
        setStatus(decoded ? 'authenticated' : 'unauthenticated');
      } catch {
        if (!active) return;
        setStatus('unauthenticated');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const pair = await api<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      { method: 'POST', body: { email, password } },
    );
    persistSession(pair);
    const decoded = decodeAccessToken(pair.accessToken);
    setUser(decoded);
    setStatus(decoded ? 'authenticated' : 'unauthenticated');
  };

  const logout = async (): Promise<void> => {
    const refresh = getStoredRefreshToken();
    if (refresh) {
      try {
        await api('/auth/logout', { method: 'POST', body: { refreshToken: refresh } });
      } catch {
        /* best-effort revoke — still clear the local session */
      }
    }
    clearSession();
    setUser(null);
    setStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}