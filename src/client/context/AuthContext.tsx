import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../../types/AuthUser.type";
import axios from "axios";

const SESSION_STORAGE_KEY = "auth_session";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Use localStorage so session persists across reloads and tab closes */
function getStoredToken(): string | null {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(SESSION_STORAGE_KEY, token);
    else localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    const token = getStoredToken();
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    const token = getStoredToken();
    await axios.post(`${import.meta.env}/api/auth/logout`, undefined, {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setStoredToken(null);
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
