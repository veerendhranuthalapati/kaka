import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AuthUser } from "../types";

const CATEGORIES = ["Sedan", "SUV", "Truck", "Electric", "Coupe"];

export function TopBar({
  user,
  onLogout,
  onCategorySelect,
  onInventoryClick,
}: {
  user: AuthUser | null;
  onLogout: () => void;
  onCategorySelect: (category: string) => void;
  onInventoryClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-ink">
          Auto Yard
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          <button type="button" className="link text-sm" onClick={onInventoryClick}>
            Inventory
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className="text-sm font-medium text-muted hover:text-ink"
              onClick={() => onCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-muted">{user?.email}</span>
          <span className="badge">{user?.role}</span>
          {user?.role === "ADMIN" && (
            <Link className="link text-sm" to="/admin/vehicles/new">
              Admin
            </Link>
          )}
          <button type="button" className="btn-secondary min-h-9 px-3" onClick={onLogout}>
            Sign out
          </button>
        </div>

        <button
          type="button"
          className="btn-secondary min-h-10 px-3 md:hidden"
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
          <div className="flex flex-col gap-3">
            <button type="button" className="text-left font-medium" onClick={onInventoryClick}>
              Inventory
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className="text-left text-muted"
                onClick={() => {
                  onCategorySelect(category);
                  setMenuOpen(false);
                }}
              >
                {category}
              </button>
            ))}
            {user?.role === "ADMIN" && (
              <Link to="/admin/vehicles/new" className="font-medium">
                Admin
              </Link>
            )}
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
