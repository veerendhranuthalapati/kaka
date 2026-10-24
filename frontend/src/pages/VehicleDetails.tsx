import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVehicleById, purchaseVehicle } from "../api/vehicles";
import { ApiError } from "../api/client";
import { Toast } from "../components/State";
import { VehicleImage } from "../components/VehicleImage";
import type { Vehicle } from "../types";
import { formatPrice } from "../utils/format";
import {
  formatCc,
  formatEconomy,
  formatKm,
  formatPower,
  formatTorque,
  formatYear,
  labelDrivetrain,
  labelFuelType,
  labelTransmission,
} from "../utils/vehicleSpecsFormat";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; vehicle: Vehicle }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [purchasing, setPurchasing] = useState(false);
  const [stockHighlight, setStockHighlight] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "danger" } | null>(
    null,
  );

  useEffect(() => {
    if (!id) {
      setState({ status: "not-found" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    getVehicleById(id)
      .then((vehicle) => {
        if (!cancelled) setState({ status: "ready", vehicle });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setState({ status: "not-found" });
          return;
        }
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Could not load vehicle",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3_500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function handlePurchase(vehicle: Vehicle) {
    if (vehicle.quantity <= 0) return;
    setPurchasing(true);
    setToast(null);
    setStockHighlight(false);
    try {
      const updated = await purchaseVehicle(vehicle.id);
      setState({ status: "ready", vehicle: updated });
      setStockHighlight(true);
      setToast({
        message: `Purchased 1 x ${updated.make} ${updated.model} - ${updated.quantity} left`,
        tone: "success",
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === "OUT_OF_STOCK") {
        setToast({ message: "Just sold out", tone: "danger" });
        setState({
          status: "ready",
          vehicle: { ...vehicle, quantity: 0 },
        });
      } else if (error instanceof ApiError) {
        setToast({ message: error.message, tone: "danger" });
      } else {
        setToast({ message: "Purchase failed. Try again.", tone: "danger" });
      }
    } finally {
      setPurchasing(false);
    }
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

  const { vehicle } = state;
  const outOfStock = vehicle.quantity <= 0;

  const specs: { label: string; value: string }[] = [
    { label: "Distance travelled", value: formatKm(vehicle.odometerKm) },
    { label: "Year", value: formatYear(vehicle.year) },
    { label: "Engine (cc)", value: formatCc(vehicle.engineCc) },
    { label: "Power", value: formatPower(vehicle.powerBhp) },
    { label: "Torque", value: formatTorque(vehicle.torqueNm) },
    { label: "Fuel type", value: labelFuelType(vehicle.fuelType) },
    { label: "Transmission", value: labelTransmission(vehicle.transmission) },
    { label: "Drivetrain", value: labelDrivetrain(vehicle.drivetrain) },
    { label: "Mileage (km/l)", value: formatEconomy(vehicle.fuelEconomyKmpl) },
    { label: "Colour", value: vehicle.color ?? "-" },
    { label: "Owners", value: vehicle.owners == null ? "-" : String(vehicle.owners) },
    { label: "VIN", value: vehicle.vin ?? "-" },
  ];

  function stockClass(quantity: number): string {
    if (quantity === 0) return "stock-out";
    if (quantity <= 2) return "stock-low";
    return "stock-ok";
  }

  return (
    <main className="shell min-w-0 py-8 lg:py-12">
      <Link className="link text-sm" to="/">← Back to inventory</Link>

      <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] lg:items-start">
        <div className="min-w-0 overflow-hidden rounded-card image-panel p-4 sm:p-6">
          <VehicleImage
            src={vehicle.imageUrl}
            category={vehicle.category}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="aspect-[2/1] w-full rounded-card"
            fixedAspect
          />
        </div>

        <aside className="surface flex flex-col gap-4 p-6 lg:sticky lg:top-24">
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

      <section className="mt-10 min-w-0">
        <h2 className="font-display text-card-title">Specifications</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
          {specs.map((row) => (
            <div key={row.label} className="min-w-0 border-b border-line/50 pb-3">
              <dt className="text-label text-muted">{row.label}</dt>
              <dd className="mt-1 font-sans text-body font-medium tabular-nums text-ink">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
