import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useVehicleData } from "../data/VehicleDataProvider";
import { PhotoCreditLine } from "../components/PhotoCreditLine";
import { Toast } from "../components/State";
import { VehicleImage } from "../components/VehicleImage";
import {
  findManifestEntryByPublicPath,
  isCategoryPhotoForVehicle,
} from "../utils/carPhotos";
import type { Vehicle } from "../types";
import { formatPrice } from "../utils/format";
import { vehicleSpecificationRows } from "../utils/vehicleSpecRows";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; vehicle: Vehicle }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function VehicleDetailsPage() {
  const { user } = useAuth();
  const { getCachedVehicle, loadVehicle, purchaseWithOptimistic } = useVehicleData();
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [purchasing, setPurchasing] = useState(false);
  const [stockHighlight, setStockHighlight] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "danger" } | null>(
    null,
  );
  const [displayedPhotoPath, setDisplayedPhotoPath] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setState({ status: "not-found" });
      return;
    }
    const cached = getCachedVehicle(id);
    if (cached) {
      setState({ status: "ready", vehicle: cached });
    } else {
      setState({ status: "loading" });
    }
    let cancelled = false;
    void loadVehicle(id)
      .then((vehicle) => {
        if (!cancelled) setState({ status: "ready", vehicle });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setState({ status: "not-found" });
          return;
        }
        if (!cached) {
          setState({
            status: "error",
            message:
              error instanceof Error ? error.message : "Could not load vehicle",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, getCachedVehicle, loadVehicle]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3_500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const vehicle = state.status === "ready" ? state.vehicle : null;
  const specRows = useMemo(
    () => (vehicle ? vehicleSpecificationRows(vehicle) : []),
    [vehicle],
  );
  const isAdmin = user?.role === "ADMIN";

  async function handlePurchase(vehicle: Vehicle) {
    if (vehicle.quantity <= 0) return;
    setPurchasing(true);
    setToast(null);
    setStockHighlight(false);
    const result = await purchaseWithOptimistic(vehicle);
    if (result.ok) {
      setState({ status: "ready", vehicle: result.vehicle });
      setStockHighlight(true);
      setToast({
        message: `Purchased 1 x ${result.vehicle.make} ${result.vehicle.model} - ${result.vehicle.quantity} left`,
        tone: "success",
      });
    } else if (result.code === "OUT_OF_STOCK") {
      setToast({ message: "Just sold out", tone: "danger" });
      setState({
        status: "ready",
        vehicle: { ...vehicle, quantity: 0 },
      });
    } else {
      setToast({ message: result.message, tone: "danger" });
    }
    setPurchasing(false);
  }

  if (state.status === "loading") {
    return (
      <main className="shell py-8">
        <div className="h-8 w-48 skeleton rounded-btn" />
        <div className="mt-6 aspect-[16/9] skeleton rounded-card" />
        <div className="mt-8 grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 skeleton rounded-btn" />
          ))}
        </div>
      </main>
    );
  }

  if (state.status === "not-found") {
    return (
      <main className="shell py-8">
        <p className="font-display text-section-title">Vehicle not found.</p>
        <Link className="link mt-4 inline-block" to="/">Back to inventory</Link>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="shell py-8">
        <p role="alert">{state.message}</p>
      </main>
    );
  }

  if (!vehicle) {
    return null;
  }

  const outOfStock = vehicle.quantity <= 0;

  function stockClass(quantity: number): string {
    if (quantity === 0) return "stock-out";
    if (quantity <= 2) return "stock-low";
    return "stock-ok";
  }

  return (
    <main className="shell min-w-0 py-8 lg:py-12">
      <Link className="link text-sm" to="/">← Back to inventory</Link>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] lg:items-start lg:gap-5">
        <div className="min-w-0 overflow-hidden rounded-card image-panel p-4 sm:p-6">
          <VehicleImage
            src={vehicle.imageUrl}
            category={vehicle.category}
            vehicleId={vehicle.id}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="aspect-[2/1] w-full rounded-card"
            fixedAspect
            onDisplayChange={(info) => setDisplayedPhotoPath(info.path)}
          />
          {displayedPhotoPath &&
            isCategoryPhotoForVehicle(vehicle, displayedPhotoPath) && (
              <p className="mt-3 text-sm text-muted">Illustrative photo</p>
            )}
          {displayedPhotoPath && findManifestEntryByPublicPath(displayedPhotoPath) && (
            <div className="mt-2">
              <PhotoCreditLine entry={findManifestEntryByPublicPath(displayedPhotoPath)!} />
            </div>
          )}
        </div>

        <aside className="surface flex flex-col gap-4 p-6 lg:sticky lg:top-20 lg:self-start">
          <div>
            <span className="badge-category">{vehicle.category}</span>
            <h1 className="mt-3 font-display text-section-title tracking-tight">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-price mt-3">{formatPrice(vehicle.price)}</p>
            <p
              className={`mt-2 ${stockClass(vehicle.quantity)} ${stockHighlight ? "stock-updated" : ""}`}
            >
              {outOfStock ? "Out of stock" : `${vehicle.quantity} in stock`}
            </p>
          </div>
          {toast && <Toast message={toast.message} tone={toast.tone} />}
          <button
            type="button"
            className={`btn-primary w-full ${purchasing ? "btn-skeleton" : ""}`}
            disabled={outOfStock || purchasing}
            aria-busy={purchasing}
            onClick={() => handlePurchase(vehicle)}
          >
            {outOfStock ? "Out of stock" : purchasing ? "Purchasing…" : "Purchase"}
          </button>
        </aside>
      </div>

      {vehicle.description?.trim() && (
        <section className="mt-10 min-w-0">
          <h2 className="font-display text-card-title">Overview</h2>
          <p className="mt-3 max-w-3xl text-body text-muted">{vehicle.description}</p>
        </section>
      )}

      {vehicle.features.length > 0 && (
        <section className="mt-8 min-w-0">
          <h2 className="font-display text-card-title">Features</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {vehicle.features.map((feature) => (
              <li key={feature} className="spec-chip">{feature}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 min-w-0">
        <h2 className="font-display text-card-title">Specifications</h2>
        {specRows.length === 0 ? (
          <p className="mt-4 text-muted">
            Specifications not provided yet.
            {isAdmin && id && (
              <>
                {" "}
                <Link className="link" to={`/admin/vehicles/${id}/edit`}>
                  Add specifications
                </Link>
              </>
            )}
          </p>
        ) : (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            {specRows.map((row) => (
              <div key={row.label} className="min-w-0 border-b border-line/50 pb-3">
                <dt className="text-label text-muted">{row.label}</dt>
                <dd className="mt-1 font-sans text-body font-medium tabular-nums text-ink">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </main>
  );
}
