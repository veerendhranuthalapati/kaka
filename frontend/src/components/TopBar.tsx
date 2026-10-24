import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { AuthUser } from "../types";

const CATEGORIES = ["Sedan", "SUV", "Truck", "Electric", "Coupe"];

export function TopBar({
  user,
  onLogout,
  onCategorySelect,
  onInventoryClick,
  activeCategory,
}: {
  user: AuthUser | null;
  onLogout: () => void;
  onCategorySelect: (category: string) => void;
  onInventoryClick: () => void;
  activeCategory?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-ui ease-gentle motion-reduce:transition-none ${
        scrolled
          ? "border-line/90 bg-surface/85 shadow-resting backdrop-blur-md"
          : "border-line/60 bg-surface/95 backdrop-blur-sm"
      }`}
    >
      <div className="shell grid h-[4.25rem] grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link
          to="/"
          className="font-display text-card-title tracking-tight text-ink whitespace-nowrap"
        >
          Auto Yard
        </Link>

        <nav
          className="hidden items-center justify-center gap-1 md:flex"
          aria-label="Primary"
        >
          <button
            type="button"
            className={`nav-link whitespace-nowrap ${!activeCategory ? "nav-link-active" : ""}`}
            onClick={onInventoryClick}
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
              onClick={() => onCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <span className="hidden max-w-[12rem] truncate font-sans text-body text-muted lg:inline">
            {user?.email}
          </span>
          <span className="badge hidden lg:inline whitespace-nowrap">{user?.role}</span>
          {user?.role === "ADMIN" && (
            <Link className="link text-body whitespace-nowrap" to="/admin/vehicles/new">
              Admin
            </Link>
          )}
          <div className="relative lg:hidden" ref={accountRef}>
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
                className="absolute right-0 top-full z-50 mt-1 min-w-[12rem] rounded-card border border-line bg-surface p-3 shadow-resting"
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
            className="btn-ghost hidden min-h-11 whitespace-nowrap px-3 lg:inline-flex"
            onClick={onLogout}
          >
            Sign out
          </button>
        </div>

        <button
          type="button"
          className="btn-secondary col-start-3 justify-self-end whitespace-nowrap px-3 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-line bg-surface px-4 py-4 md:hidden"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="nav-link text-left whitespace-nowrap"
              onClick={() => {
                onInventoryClick();
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
                  onCategorySelect(category);
                  setMenuOpen(false);
                }}
              >
                {category}
              </button>
            ))}
            <p className="truncate px-3 pt-2 text-sm text-muted">{user?.email}</p>
            <p className="px-3 text-label text-ink">{user?.role}</p>
            {user?.role === "ADMIN" && (
              <Link to="/admin/vehicles/new" className="nav-link font-medium whitespace-nowrap">
                Admin
              </Link>
            )}
            <button type="button" className="btn-secondary mt-2 whitespace-nowrap" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
