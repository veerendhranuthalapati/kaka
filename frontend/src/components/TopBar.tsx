import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { AuthUser } from "../types";
import { useTopBarActions } from "./TopBarActionsContext";

const CATEGORIES = ["Sedan", "SUV", "Truck", "Electric", "Coupe"];

export function TopBar({
  user,
  onLogout,
  variant = "full",
}: {
  user: AuthUser | null;
  onLogout: () => void;
  variant?: "full" | "minimal";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeCategory, onCategorySelect, onInventoryClick } =
    useTopBarActions();

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [accountOpen]);

  function handleBrandClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (location.pathname !== "/") return;
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: reduced ? "instant" : "smooth",
    });
  }

  function handleInventoryClick() {
    if (location.pathname === "/" && onInventoryClick) {
      onInventoryClick();
      return;
    }
    navigate("/");
  }

  function handleCategorySelect(category: string) {
    if (location.pathname === "/" && onCategorySelect) {
      onCategorySelect(category);
      return;
    }
    navigate("/");
  }

  const minimal = variant === "minimal";

  return (
    <header
      data-testid="app-top-bar"
      className="app-top-bar glass-bar sticky top-0 z-40 shadow-glass"
    >
      <div className="shell grid h-[4.25rem] grid-cols-[auto_1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Link
          to="/"
          aria-label="Auto Yard, go to home"
          onClick={handleBrandClick}
          className="font-display text-card-title tracking-tight text-ink whitespace-nowrap shrink-0 transition-colors hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Auto Yard
        </Link>

        {!minimal && (
          <nav
            className="hidden items-center justify-center gap-1 md:flex"
            aria-label="Primary"
          >
            <button
              type="button"
              className={`nav-link whitespace-nowrap ${!activeCategory ? "nav-link-active" : ""}`}
              onClick={handleInventoryClick}
            >
              Inventory
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`nav-link whitespace-nowrap ${
                  activeCategory === category ? "nav-link-active" : ""
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center justify-end gap-3">
          {minimal ? (
            <nav aria-label="Secondary" className="flex items-center gap-3">
              {location.pathname !== "/login" && (
                <Link className="link text-body whitespace-nowrap" to="/login">
                  Sign in
                </Link>
              )}
              {location.pathname !== "/register" && (
                <Link className="link text-body whitespace-nowrap" to="/register">
                  Register
                </Link>
              )}
              {location.pathname !== "/credits" && (
                <Link className="link text-body whitespace-nowrap" to="/credits">
                  Credits
                </Link>
              )}
            </nav>
          ) : (
            <>
              <span className="hidden max-w-[12rem] truncate font-sans text-body text-muted lg:inline">
                {user?.email}
              </span>
              <span className="badge hidden lg:inline whitespace-nowrap">
                {user?.role}
              </span>
              {user?.role === "ADMIN" && (
                <Link
                  className="link hidden text-body whitespace-nowrap md:inline"
                  to="/admin/vehicles/new"
                >
                  Admin
                </Link>
              )}
              <div className="relative hidden md:block lg:hidden" ref={accountRef}>
                <button
                  type="button"
                  className="btn-ghost min-h-11 whitespace-nowrap px-3"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  Account
                </button>
                {accountOpen && (
                  <div
                    className="dialog-panel absolute right-0 top-full z-50 mt-1 min-w-[12rem] rounded-card border border-line/80 bg-surface/95 p-3 shadow-lift backdrop-blur-xl"
                    role="menu"
                  >
                    <p className="truncate text-sm text-muted">{user?.email}</p>
                    <p className="mt-1 text-label text-ink">{user?.role}</p>
                    {user?.role === "ADMIN" && (
                      <Link
                        className="link mt-2 block text-body whitespace-nowrap"
                        to="/admin/vehicles/new"
                        onClick={() => setAccountOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      className="btn-ghost mt-3 w-full whitespace-nowrap"
                      onClick={onLogout}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn-ghost hidden min-h-11 whitespace-nowrap px-3 md:inline-flex"
                onClick={onLogout}
              >
                Sign out
              </button>
              <button
                type="button"
                className="btn-secondary whitespace-nowrap px-3 md:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen((open) => !open)}
              >
                Menu
              </button>
            </>
          )}
        </div>
      </div>

      {!minimal && menuOpen && (
        <div
          id="mobile-nav"
          className="drawer-panel border-t border-line/60 bg-surface/95 px-4 py-4 backdrop-blur-xl md:hidden"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="nav-link text-left whitespace-nowrap"
              onClick={() => {
                handleInventoryClick();
                setMenuOpen(false);
              }}
            >
              Inventory
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`nav-link text-left whitespace-nowrap ${
                  activeCategory === category ? "nav-link-active" : ""
                }`}
                onClick={() => {
                  handleCategorySelect(category);
                  setMenuOpen(false);
                }}
              >
                {category}
              </button>
            ))}
            <p className="truncate px-3 pt-2 text-sm text-muted">{user?.email}</p>
            <p className="px-3 text-label text-ink">{user?.role}</p>
            {user?.role === "ADMIN" && (
              <Link
                to="/admin/vehicles/new"
                className="nav-link font-medium whitespace-nowrap"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              className="btn-secondary mt-2 whitespace-nowrap"
              onClick={onLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
