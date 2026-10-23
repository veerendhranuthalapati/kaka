import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, registerRequest } from "../api/auth";
import { ApiError, setUnauthorizedHandler } from "../api/client";
import type { AuthUser } from "../types";
import {
  clearSession,
  decodeToken,
  readSession,
  saveSession,
  type Session,
} from "./session";

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function requireDecodedUser(token: string): AuthUser {
  const user = decodeToken(token);

  if (!user) {
    throw new ApiError(401, "INVALID_TOKEN", "The session token is invalid.");
  }

  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(() => readSession());

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setSession(null);
      navigate("/login", { replace: true });
    });

    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    const user = requireDecodedUser(response.token);
    saveSession(response.token);
    setSession({ token: response.token, user });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const response = await registerRequest({ email, password });
    const user = requireDecodedUser(response.token);
    saveSession(response.token);
    setSession({ token: response.token, user });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      login,
      register,
      logout,
    }),
    [login, logout, register, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
