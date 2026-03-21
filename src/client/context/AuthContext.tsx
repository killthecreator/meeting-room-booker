import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../../types/AuthUser.type";

import { api } from "../api";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getVerifiedUser = useCallback(async () => {
    await api.auth
      .verifyToken()
      .then((res) => !!res.data && setUser(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void getVerifiedUser();
  }, [getVerifiedUser]);

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      setLoading(false);
      await api.auth.generateSession({ code });
      await getVerifiedUser();
    },
    onError: () => {
      setLoading(false);
      setError("Sign in failed. Please try again.");
    },
    flow: "auth-code",
  });

  const login = useCallback(async () => {
    setLoading(true);
    googleLogin();
  }, [googleLogin]);

  const logout = useCallback(async () => {
    setUser(null);
    await api.auth.logout();
    googleLogout();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
    }),
    [error, loading, login, logout, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
