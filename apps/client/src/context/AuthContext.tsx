import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@meeting-calendar/shared";

import { api } from "../api";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";

type AuthContextValue = {
  user: AuthUser | null;
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
  const [error, setError] = useState<string | null>(null);

  const getVerifiedUser = useCallback(async () => {
    await api.auth
      .verifyToken()
      .then((res) => !!res.data && setUser(res.data))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    void getVerifiedUser();
  }, [getVerifiedUser]);

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      try {
        await api.auth.generateSession({ code });
        await getVerifiedUser();
      } catch {
        setError("Sign in failed. Please try again.");
      }
    },
    onError: () => {
      setError("Sign in failed. Please try again.");
    },

    flow: "auth-code",
  });

  const login = useCallback(async () => {
    setError(null);
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
      error,
      login,
      logout,
    }),
    [error, login, logout, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
