import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
  searchVehicles,
} from "../api/vehicles";
import { ApiError } from "../api/client";
import { BottomActionBar } from "../components/BottomActionBar";
import { HeroCarousel } from "../components/HeroCarousel";
import {
  InventorySkeletonCard,
  InventoryVehicleCard,
} from "../components/InventoryVehicleCard";
import { RestockDialog } from "../components/RestockDialog";
import { ConfirmDialog, EmptyState, Toast } from "../components/State";
import { TopBar } from "../components/TopBar";
import { VehicleDetailsDialog } from "../components/VehicleDetailsDialog";
import type { Vehicle, VehicleSearchParams } from "../types";
import { selectFeaturedVehicles } from "../utils/featuredVehicles";

const DEBOUNCE_MS = 300;

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<VehicleSearchParams>({});
  const [draftSearch, setDraftSearch] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [restockingVehicle, setRestockingVehicle] = useState<Vehicle | null>(null);
  const [detailsVehicle, setDetailsVehicle] = useState<Vehicle | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inventoryRef = useRef<HTMLElement>(null);

  const canManage = user?.role === "ADMIN";

  const load = useCallback(async (nextFilters: VehicleSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchVehicles(nextFilters);
      setVehicles(data);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("Failed to load vehicles.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load(filters);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [filters, load]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3_500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const featured = useMemo(() => selectFeaturedVehicles(vehicles), [vehicles]);

  const categories = useMemo(() => {
    const unique = new Set(vehicles.map((vehicle) => vehicle.category));
    return Array.from(unique).sort();
  }, [vehicles]);

  async function handlePurchase(vehicle: Vehicle) {
    if (purchasingId || vehicle.quantity === 0) return;

    setPurchasingId(vehicle.id);
    setToast(null);

    try {
      const updated = await purchaseVehicle(vehicle.id);
      setVehicles((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "OUT_OF_STOCK") {
        setToast("Just sold out");
        setVehicles((current) =>
          current.map((item) =>
            item.id === vehicle.id ? { ...item, quantity: 0 } : item,
          ),
        );
      } else if (caught instanceof ApiError) {
        setToast(caught.message);
      } else {
        setToast("Purchase failed. Try again.");
      }
    } finally {
      setPurchasingId(null);
    }
  }

  function scrollToInventory() {
    inventoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyQuickSearch(value: string) {
    setDraftSearch(value);
    setFilters((current) => ({
      ...current,
      make: value || undefined,
    }));
  }

  return (
    <div className="min-h-screen bg-canvas pb-32">
      <TopBar
        user={user}
        onLogout={logout}
        onInventoryClick={scrollToInventory}
        activeCategory={filters.category}
        onCategorySelect={(category) => setFilters({ category })}
      />

      <main className="shell grid gap-12 py-8 lg:py-12">
        <section className="grid gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Find your next drive
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              Featured in-stock vehicles rotate by newest arrivals (max six). Browse
              the full inventory below.
            </p>
          </div>
          {featured.length > 0 && (
            <HeroCarousel
              vehicles={featured}
              purchasingId={purchasingId}
              onPurchase={handlePurchase}
              onDetails={setDetailsVehicle}
            />
          )}
        </section>

        <section
          ref={inventoryRef}
          id="inventory"
          aria-label="Inventory"
          className="grid gap-6"
        >
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-section-title tracking-tight">Inventory</h2>
            <p className="font-sans text-body text-muted">
              Search and filter without leaving the page.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <label className="label" htmlFor="inventory-search">Search</label>
              <input
                id="inventory-search"
                ref={searchInputRef}
                className="input"
                placeholder="Make or model"
                value={draftSearch}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraftSearch(value);
                  setFilters((current) => ({
                    ...current,
                    make: value || undefined,
                    model: undefined,
                  }));
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    filters.category === category
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-line text-muted hover:text-ink"
                  }`}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      category: current.category === category ? undefined : category,
                    }))
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <div>
              <label className="label" htmlFor="min-price">Min price</label>
              <input
                id="min-price"
                type="number"
                min={0}
                className="input"
                onChange={(event) => {
                  const value = event.target.value;
                  setFilters((current) => ({
                    ...current,
                    minPrice: value === "" ? undefined : Number(value),
                  }));
                }}
              />
            </div>
            <div>
              <label className="label" htmlFor="max-price">Max price</label>
              <input
                id="max-price"
                type="number"
                min={0}
                className="input"
                onChange={(event) => {
                  const value = event.target.value;
                  setFilters((current) => ({
                    ...current,
                    maxPrice: value === "" ? undefined : Number(value),
                  }));
                }}
              />
            </div>
          </div>

          {toast && <Toast message={toast} tone="danger" />}

          {error && (
            <div className="surface flex flex-col items-center gap-3 p-8 text-center">
              <p className="font-semibold">Could not load inventory</p>
              <p className="text-sm text-muted">{error}</p>
              <button type="button" className="btn-secondary" onClick={() => void load(filters)}>
                Retry
              </button>
            </div>
          )}

          {!error && loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <InventorySkeletonCard key={index} />
              ))}
            </div>
          )}

          {!error && !loading && vehicles.length === 0 && (
            <EmptyState
              title="No vehicles match"
              description="Try clearing filters or adjusting your price range."
            />
          )}

          {!error && !loading && vehicles.length > 0 && (
            <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="inventory-enter min-w-0"
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                >
                <InventoryVehicleCard
                  vehicle={vehicle}
                  canManage={canManage}
                  purchasing={purchasingId === vehicle.id}
                  onPurchase={handlePurchase}
                  onDetails={setDetailsVehicle}
                  onEdit={(item) => {
                    window.location.assign(`/admin/vehicles/${item.id}/edit`);
                  }}
                  onRestock={setRestockingVehicle}
                  onDelete={setDeletingVehicle}
                />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomActionBar
        searchInputRef={searchInputRef}
        onBrowseInventory={scrollToInventory}
        onQuickSearch={applyQuickSearch}
      />

      <VehicleDetailsDialog
        vehicle={detailsVehicle}
        open={Boolean(detailsVehicle)}
        onClose={() => setDetailsVehicle(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingVehicle)}
        title={
          deletingVehicle
            ? `Delete ${deletingVehicle.make} ${deletingVehicle.model}?`
            : "Delete vehicle?"
        }
        description="This action removes the vehicle permanently from inventory."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deletingVehicle) return;
          await deleteVehicle(deletingVehicle.id);
          setVehicles((current) =>
            current.filter((item) => item.id !== deletingVehicle.id),
          );
          setDeletingVehicle(null);
        }}
        onCancel={() => setDeletingVehicle(null)}
      />

      <RestockDialog
        vehicle={restockingVehicle}
        onRestock={async (vehicle, amount) => {
          const updated = await restockVehicle(vehicle.id, amount);
          setVehicles((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
        }}
        onClose={() => setRestockingVehicle(null)}
      />
    </div>
  );
}
