import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../../types/AuthUser.type";
import { jwtDecode } from "jwt-decode";

import { api } from "../api";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { googleAuthSchema } from "../../schemas/authUser";
import { cleanStoredToken, setStoredToken } from "../lib/storedAuthToken";
import type { AxiosPromise } from "axios";

type AuthContextValue = {
  user: AuthUser | undefined;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  verifyAuthTokenPromise: AxiosPromise<AuthUser | undefined>;
  children: ReactNode;
};

export function AuthProvider({
  children,
  verifyAuthTokenPromise,
}: AuthProviderProps) {
  const initUserRes = use(verifyAuthTokenPromise);

  const [user, setUser] = useState<AuthUser | undefined>(initUserRes.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      setLoading(false);
      const res = await api.auth.google({ code });
      if (!res.data.id_token) {
        setError("Sign in failed: no id_token");
        return;
      }
      const token = res.data.id_token;
      const profile = jwtDecode(token);
      setStoredToken(token, res.data.expiry_date);
      setUser(googleAuthSchema.parse(profile));
      setError(null);
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

  const logout = useCallback(() => {
    setUser(undefined);

    googleLogout();
    cleanStoredToken();
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
