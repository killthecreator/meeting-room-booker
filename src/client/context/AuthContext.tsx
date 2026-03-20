import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../../types/AuthUser.type";
import { jwtDecode } from "jwt-decode";

import { api } from "../api";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { googleAuthSchema } from "../../schemas/authUser";
import { setStoredToken } from "../lib/storedAuthToken";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      const res = await api.auth.google({ code });
      if (!res.data.id_token) {
        setError("Sign in failed: no id_token");
        return;
      }
      const token = res.data.id_token;
      const profile = jwtDecode(token);
      setStoredToken(token);
      setUser(googleAuthSchema.parse(profile));
      setError(null);
    },
    onError: () => {
      setError("Sign in failed. Please try again.");
    },
    flow: "auth-code",
  });

  const login = useCallback(() => {
    setLoading(true);
    googleLogin();
    setLoading(false);
  }, [googleLogin]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login,
      logout: googleLogout,
    }),
    [error, loading, login, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
