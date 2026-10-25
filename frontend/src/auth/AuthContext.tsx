import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, logoutRequest, registerRequest } from "../api/auth";
import { ApiError, setUnauthorizedHandler } from "../api/client";
import type { AuthUser } from "../types";
import { AUTH_IDLE_TIMEOUT_MS } from "./constants";
import {
  clearSession,
  isTokenStructurallyValid,
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

function requireUserFromResponse(
  token: string,
  user: AuthUser,
): { token: string; user: AuthUser } {
  if (!isTokenStructurallyValid(token)) {
    throw new ApiError(401, "INVALID_TOKEN", "The session token is invalid.");
  }
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [idleToast, setIdleToast] = useState<string | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    void logoutRequest().catch(() => {});
    clearSession();
    setSession(null);
    clearIdleTimer();
  }, [clearIdleTimer]);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimer();
    if (!session?.token) return;
    idleTimer.current = setTimeout(() => {
      setIdleToast("Signed out after 30 minutes of inactivity.");
      logout();
      navigate("/login", { replace: true });
    }, AUTH_IDLE_TIMEOUT_MS);
  }, [clearIdleTimer, logout, navigate, session?.token]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setSession(null);
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  useEffect(() => {
    if (!session?.token) {
      clearIdleTimer();
      return;
    }
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const onActivity = () => resetIdleTimer();
    for (const event of events) {
      window.addEventListener(event, onActivity, { passive: true });
    }
    resetIdleTimer();
    return () => {
      for (const event of events) {
        window.removeEventListener(event, onActivity);
      }
      clearIdleTimer();
    };
  }, [clearIdleTimer, resetIdleTimer, session?.token]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    const next = requireUserFromResponse(response.token, response.user);
    saveSession(next.token, next.user);
    setSession(next);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const response = await registerRequest({ email, password });
    const next = requireUserFromResponse(response.token, response.user);
    saveSession(next.token, next.user);
    setSession(next);
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

  return (
    <AuthContext.Provider value={value}>
      {idleToast && (
        <div className="sr-only" role="status" aria-live="polite">
          {idleToast}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
