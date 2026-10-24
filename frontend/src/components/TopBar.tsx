import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

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
          className="font-display text-card-title tracking-tight text-ink"
        >
          Auto Yard
        </Link>

        <nav
          className="hidden items-center justify-center gap-1 md:flex"
          aria-label="Primary"
        >
          <button
            type="button"
            className={`nav-link ${!activeCategory ? "nav-link-active" : ""}`}
            onClick={onInventoryClick}
          >
            Inventory
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`nav-link ${
                activeCategory === category ? "nav-link-active" : ""
              }`}
              onClick={() => onCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <span className="max-w-[10rem] truncate font-sans text-body text-muted">
            {user?.email}
          </span>
          <span className="badge">{user?.role}</span>
          {user?.role === "ADMIN" && (
            <Link className="link text-body" to="/admin/vehicles/new">
              Admin
            </Link>
          )}
          <button type="button" className="btn-ghost min-h-11 px-3" onClick={onLogout}>
            Sign out
          </button>
        </div>

        <button
          type="button"
          className="btn-secondary col-start-3 justify-self-end px-3 md:hidden"
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
              className="nav-link text-left"
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
                className={`nav-link text-left ${
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
            {user?.role === "ADMIN" && (
              <Link to="/admin/vehicles/new" className="nav-link font-medium">
                Admin
              </Link>
            )}
            <button type="button" className="btn-secondary mt-2" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
