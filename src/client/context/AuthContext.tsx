import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../../types/AuthUser.type";

import { api } from "../api";
import { setStoredToken } from "../lib/storedAuthToken";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    const res = await api.auth.getUser();
    if (res.data) {
      setUser(res.data);
      setError(null);
      return;
    }
    setUser(null);
    setStoredToken(null);
    if (res.status === 401) setError(null);
    else setError("Failed to load session");
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#session=")) {
      const token = decodeURIComponent(hash.slice("#session=".length));
      setStoredToken(token);
      window.history.replaceState(
        "",
        document.title,
        window.location.pathname + window.location.search,
      );
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser]);

  const login = useCallback(() => {
    setError(null);
    window.location.href = `/api/auth/google`;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
