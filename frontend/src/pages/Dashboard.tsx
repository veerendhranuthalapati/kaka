import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
  searchVehicles,
} from "../api/vehicles";
import { ApiError } from "../api/client";
import { VehicleCard } from "../components/VehicleCard";
import { SearchFilters } from "../components/SearchFilters";
import {
  ConfirmDialog,
  EmptyState,
  Spinner,
  Toast,
} from "../components/State";
import { RestockDialog } from "../components/RestockDialog";
import type { Vehicle, VehicleSearchParams } from "../types";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<VehicleSearchParams>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [restockingVehicle, setRestockingVehicle] = useState<Vehicle | null>(
    null,
  );

  const canManage = user?.role === "ADMIN";

  async function load(nextFilters: VehicleSearchParams) {
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
  }

  useEffect(() => {
    void load(filters);
  }, [filters]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3_500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const hasFilters = useMemo(
    () => Object.keys(filters).length > 0,
    [filters],
  );

  async function handlePurchase(vehicle: Vehicle) {
    if (purchasingId || vehicle.quantity === 0) {
      return;
    }

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

  async function handleDeleteConfirm() {
    if (!deletingVehicle) return;
    try {
      await deleteVehicle(deletingVehicle.id);
      setVehicles((current) =>
        current.filter((item) => item.id !== deletingVehicle.id),
      );
      setDeletingVehicle(null);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setToast(caught.message);
      } else {
        setToast("Failed to delete vehicle.");
      }
    }
  }

  async function handleRestockSubmit(vehicle: Vehicle, amount: number) {
    const updated = await restockVehicle(vehicle.id, amount);
    setVehicles((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Auto Yard
            </p>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Dealership inventory
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>{user?.email}</span>
            <span className="badge">{user?.role}</span>
            {canManage && (
              <Link className="link" to="/admin/vehicles/new">
                Add vehicle
              </Link>
            )}
            <button
              type="button"
              className="btn-secondary min-h-8 px-2.5 py-1 text-xs"
              onClick={logout}
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="shell grid gap-6 py-6 sm:py-8">
        <SearchFilters
          onApply={setFilters}
          onClear={() => setFilters({})}
        />

        {toast && <Toast message={toast} tone="danger" />}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <div className="surface flex flex-col items-center gap-3 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-ink">
              Something went wrong
            </p>
            <p className="max-w-md text-sm text-muted">{error}</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void load(filters)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <EmptyState
            title={hasFilters ? "No matches" : "No vehicles yet"}
            description={
              hasFilters
                ? "Try clearing filters or adjusting your price range."
                : "Check back soon or ask an admin to add inventory."
            }
          />
        )}

        {!loading && !error && vehicles.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                canManage={canManage}
                purchasing={purchasingId === vehicle.id}
                onPurchase={handlePurchase}
                onRestock={(v) => setRestockingVehicle(v)}
                onDelete={(v) => setDeletingVehicle(v)}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(deletingVehicle)}
        title={
          deletingVehicle
            ? `Delete ${deletingVehicle.make} ${deletingVehicle.model}?`
            : "Delete vehicle?"
        }
        description="This action removes the vehicle permanently from inventory."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingVehicle(null)}
      />

      <RestockDialog
        vehicle={restockingVehicle}
        onRestock={handleRestockSubmit}
        onClose={() => setRestockingVehicle(null)}
      />
    </div>
  );
}
