import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { TopBar } from "./TopBar";
import { TopBarActionsProvider } from "./TopBarActionsContext";

const MINIMAL_PATHS = new Set(["/login", "/register", "/credits"]);

export function isMinimalTopBarPath(pathname: string): boolean {
  if (MINIMAL_PATHS.has(pathname)) return true;
  return pathname !== "/" && !pathname.startsWith("/vehicles") && !pathname.startsWith("/admin");
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const variant = isMinimalTopBarPath(pathname) ? "minimal" : "full";

  return (
    <TopBarActionsProvider>
      <TopBar user={user} onLogout={logout} variant={variant} />
      <Outlet />
    </TopBarActionsProvider>
  );
}
