import {
  lazy,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SAMPLE_CATALOG_VEHICLE_COUNT } from "../constants/demoCatalog";
import { useAuth } from "../auth/AuthContext";
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
import {
  SCROLL_RESTORE_KEY,
  useVehicleData,
  useVehicleSearch,
} from "../data/VehicleDataProvider";
import type { Vehicle, VehicleSearchParams } from "../types";
import { selectFeaturedVehicles } from "../utils/featuredVehicles";
import {
  emptyVehicleFormValues,
  vehicleToDuplicateFormValues,
  type VehicleFormValues,
} from "../utils/vehicleFormModel";
import { searchFiltersActive } from "../utils/vehicleSearchMatch";

const VehicleCreateDrawer = lazy(() =>
  import("../components/VehicleCreateDrawer").then((mod) => ({
    default: mod.VehicleCreateDrawer,
  })),
);

export function DashboardPage() {
  const { user, logout } = useAuth();
  const {
    purchaseWithOptimistic,
    deleteVehicleFromCache,
    restockVehicleInCache,
    createVehicleForSearch,
    bumpSearchRefresh,
  } = useVehicleData();
  const [filters, setFilters] = useState<VehicleSearchParams>({});
  const deferredFilters = useDeferredValue(filters);
  const { vehicles, loading, isRevalidating, error } = useVehicleSearch(deferredFilters);
  const [draftSearch, setDraftSearch] = useState("");
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "danger" } | null>(
    null,
  );
  const [stockHighlightId, setStockHighlightId] = useState<string | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [restockingVehicle, setRestockingVehicle] = useState<Vehicle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("Add vehicle");
  const [drawerInitialValues, setDrawerInitialValues] = useState<VehicleFormValues>(
    emptyVehicleFormValues(),
  );
  const [insertHighlightId, setInsertHighlightId] = useState<string | null>(null);
  const [loadSampleOpen, setLoadSampleOpen] = useState(false);
  const [loadSampleBusy, setLoadSampleBusy] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inventoryRef = useRef<HTMLElement>(null);

  const canManage = user?.role === "ADMIN";
  const filtersActive = searchFiltersActive(deferredFilters);
  const inventoryEmpty = !loading && !error && vehicles.length === 0;

  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_RESTORE_KEY);
    if (saved) {
      const y = Number(saved);
      sessionStorage.removeItem(SCROLL_RESTORE_KEY);
      if (Number.isFinite(y)) {
        window.requestAnimationFrame(() => window.scrollTo(0, y));
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.setItem(SCROLL_RESTORE_KEY, String(window.scrollY));
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3_500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!insertHighlightId) return;
    const timer = window.setTimeout(() => {
      const heading = document.getElementById(`vehicle-heading-${insertHighlightId}`);
      if (heading && typeof heading.scrollIntoView === "function") {
        heading.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      if (heading instanceof HTMLElement) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }, 80);
    const clearHighlight = window.setTimeout(() => setInsertHighlightId(null), 900);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clearHighlight);
    };
  }, [insertHighlightId, vehicles]);

  function openCreateDrawer(values: VehicleFormValues, title: string) {
    setDrawerInitialValues(values);
    setDrawerTitle(title);
    setDrawerOpen(true);
  }

  async function handleLoadSampleConfirm() {
    if (loadSampleBusy) return;
    setLoadSampleBusy(true);
    setToast(null);
    try {
      const { loadDemoVehicles } = await import("../api/admin");
      const result = await loadDemoVehicles();
      setLoadSampleOpen(false);
      setToast({
        message: `Added ${result.created}, updated ${result.updated}`,
        tone: "success",
      });
      bumpSearchRefresh();
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.status === 404) {
          const { DEMO_VEHICLES_DISABLED_MESSAGE } = await import("../api/admin");
          setToast({ message: DEMO_VEHICLES_DISABLED_MESSAGE, tone: "danger" });
        } else if (caught.status === 403) {
          setToast({ message: caught.message, tone: "danger" });
        } else if (caught.code === "TOO_MANY_REQUESTS") {
          setToast({ message: caught.message, tone: "danger" });
        } else if (caught.status >= 500 || caught.code === "SERVICE_UNAVAILABLE") {
          setToast({ message: caught.message, tone: "danger" });
        } else {
          setToast({ message: caught.message, tone: "danger" });
        }
      } else {
        setToast({
          message: "Could not reach the server. Check your connection.",
          tone: "danger",
        });
      }
    } finally {
      setLoadSampleBusy(false);
    }
  }

  const featured = useMemo(() => selectFeaturedVehicles(vehicles), [vehicles]);

  const categories = useMemo(() => {
    const unique = new Set(vehicles.map((vehicle) => vehicle.category));
    return Array.from(unique).sort();
  }, [vehicles]);

  async function handlePurchase(vehicle: Vehicle) {
    if (purchasingId || vehicle.quantity === 0) return;

    setPurchasingId(vehicle.id);
    setToast(null);
    setStockHighlightId(null);

    const result = await purchaseWithOptimistic(vehicle);
    if (result.ok) {
      setStockHighlightId(result.vehicle.id);
      setToast({
        message: `Purchased 1 x ${result.vehicle.make} ${result.vehicle.model} - ${result.vehicle.quantity} left`,
        tone: "success",
      });
    } else if (result.code === "OUT_OF_STOCK") {
      setToast({ message: "Just sold out", tone: "danger" });
    } else {
      setToast({ message: result.message, tone: "danger" });
    }
    setPurchasingId(null);
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
    <div className="min-h-screen bg-canvas pb-32 showroom-glow">
      <TopBar
        user={user}
        onLogout={logout}
        onInventoryClick={scrollToInventory}
        activeCategory={filters.category}
        onCategorySelect={(category) => setFilters({ category })}
      />

      <main className="shell grid gap-12 py-8 lg:py-12">
        <section className="grid gap-4 content-auto-section">
          <div>
            <h1 className="font-display text-hero tracking-tight text-ink">
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
            />
          )}
        </section>

        <section
          ref={inventoryRef}
          id="inventory"
          aria-label="Inventory"
          className="grid gap-6 content-auto-section"
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
            <div className="flex flex-wrap items-center gap-2">
              {canManage && (
                <button
                  type="button"
                  className="btn-primary min-w-[9.5rem] whitespace-nowrap"
                  onClick={() =>
                    openCreateDrawer(emptyVehicleFormValues(), "Add vehicle")
                  }
                >
                  Add vehicle
                </button>
              )}
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    filters.category === category
                      ? "filter-chip-active"
                      : "filter-chip-idle"
                  }
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

          {toast && <Toast message={toast.message} tone={toast.tone} />}

          {error && (
            <div className="surface flex flex-col items-center gap-3 p-8 text-center">
              <p className="font-semibold">Could not load inventory</p>
              <p className="text-sm text-muted">{error}</p>
            </div>
          )}

          {!error && loading && (
            <div className="inventory-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <InventorySkeletonCard key={index} />
              ))}
            </div>
          )}

          {inventoryEmpty && filtersActive && (
            <EmptyState
              title="No vehicles match"
              description="Try clearing filters or adjusting your price range."
            />
          )}

          {inventoryEmpty && !filtersActive && canManage && (
            <EmptyState
              title="No vehicles yet"
              description="Add your first vehicle or load the sample catalogue to explore the dashboard."
            >
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() =>
                    openCreateDrawer(emptyVehicleFormValues(), "Add vehicle")
                  }
                >
                  Add a vehicle
                </button>
                <button
                  type="button"
                  className="btn-secondary min-w-[11rem]"
                  disabled={loadSampleBusy}
                  aria-busy={loadSampleBusy}
                  onClick={() => setLoadSampleOpen(true)}
                >
                  {loadSampleBusy ? "Loading…" : "Load sample vehicles"}
                </button>
              </div>
            </EmptyState>
          )}

          {inventoryEmpty && !filtersActive && !canManage && (
            <EmptyState
              title="No vehicles available right now"
              description="Please check back soon."
            />
          )}

          {!error && !loading && vehicles.length > 0 && (
            <div
              className={`inventory-grid transition-opacity duration-ui ${isRevalidating ? "opacity-70" : "opacity-100"}`}
            >
              {vehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="inventory-card-contain"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <InventoryVehicleCard
                    vehicle={vehicle}
                    purchasing={purchasingId === vehicle.id}
                    canManage={canManage}
                    stockHighlight={stockHighlightId === vehicle.id}
                    insertHighlight={insertHighlightId === vehicle.id}
                    headingId={`vehicle-heading-${vehicle.id}`}
                    onPurchase={handlePurchase}
                    onEdit={(item) => {
                      window.location.assign(`/admin/vehicles/${item.id}/edit`);
                    }}
                    onDuplicate={(item) =>
                      openCreateDrawer(
                        vehicleToDuplicateFormValues(item),
                        "Add similar vehicle",
                      )
                    }
                    onRestock={(item) => setRestockingVehicle(item)}
                    onDelete={(item) => setDeletingVehicle(item)}
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

      <ConfirmDialog
        open={Boolean(deletingVehicle)}
        title="Delete vehicle?"
        description={
          deletingVehicle
            ? `Remove ${deletingVehicle.make} ${deletingVehicle.model} from inventory.`
            : ""
        }
        confirmLabel="Delete"
        onCancel={() => setDeletingVehicle(null)}
        onConfirm={() => {
          if (!deletingVehicle) return;
          void deleteVehicleFromCache(deletingVehicle.id)
            .then(() => setDeletingVehicle(null))
            .catch((caught) => {
              const message =
                caught instanceof ApiError ? caught.message : "Delete failed.";
              setToast({ message, tone: "danger" });
            });
        }}
      />

      <RestockDialog
        vehicle={restockingVehicle}
        onClose={() => setRestockingVehicle(null)}
        onRestock={async (vehicle, amount) => {
          try {
            await restockVehicleInCache(vehicle.id, amount);
            setRestockingVehicle(null);
          } catch (caught) {
            const message =
              caught instanceof ApiError ? caught.message : "Restock failed.";
            setToast({ message, tone: "danger" });
          }
        }}
      />

      {drawerOpen && (
        <Suspense fallback={null}>
          <VehicleCreateDrawer
            open={drawerOpen}
            title={drawerTitle}
            initialValues={drawerInitialValues}
            onClose={() => setDrawerOpen(false)}
            onCreate={(payload) =>
              createVehicleForSearch(payload, deferredFilters)
            }
            onSuccess={(created) => {
              setInsertHighlightId(created.id);
              setToast({
                message: `Added ${created.make} ${created.model}`,
                tone: "success",
              });
            }}
          />
        </Suspense>
      )}

      <ConfirmDialog
        open={loadSampleOpen}
        title="Load sample vehicles?"
        description={`This adds the sample catalogue (about ${SAMPLE_CATALOG_VEHICLE_COUNT} vehicles). It is safe to repeat: existing sample vehicles are not duplicated. Continue?`}
        confirmLabel={loadSampleBusy ? "Loading…" : "Continue"}
        onCancel={() => {
          if (!loadSampleBusy) setLoadSampleOpen(false);
        }}
        onConfirm={() => void handleLoadSampleConfirm()}
      />
    </div>
  );
}
