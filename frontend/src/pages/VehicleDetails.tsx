import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVehicleById, purchaseVehicle } from "../api/vehicles";
import { ApiError } from "../api/client";
import { VehicleImage } from "../components/VehicleImage";
import type { Vehicle } from "../types";
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

  async function handlePurchase(vehicle: Vehicle) {
    setPurchasing(true);
    try {
      const updated = await purchaseVehicle(vehicle.id);
      setState({ status: "ready", vehicle: updated });
    } finally {
      setPurchasing(false);
    }
  }

  if (state.status === "loading") {
    return (
      <main className="mx-auto max-w-shell px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-card bg-surface-muted" />
      </main>
    );
  }

  if (state.status === "not-found") {
    return (
      <main className="mx-auto max-w-shell px-4 py-8">
        <p className="text-lg">Vehicle not found.</p>
        <Link className="link mt-4 inline-block" to="/">Back to inventory</Link>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto max-w-shell px-4 py-8">
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

  return (
    <main className="mx-auto max-w-shell px-4 py-8">
      <Link className="link text-sm" to="/">← Back to inventory</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-card bg-gradient-to-b from-surface-muted/40 to-surface-muted/10 p-4">
          <VehicleImage
            src={vehicle.imageUrl}
            category={vehicle.category}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="aspect-[2/1] w-full"
            fixedAspect
          />
        </div>
        <div>
          <h1 className="font-display text-3xl">
            {vehicle.make} {vehicle.model}
          </h1>
          <p className="mt-2 text-2xl font-display text-accent">
            ${vehicle.price.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-sm text-muted">
            {outOfStock ? "Out of stock" : `${vehicle.quantity} in stock`}
          </p>
          <button
            type="button"
            className="btn-primary mt-4"
            disabled={outOfStock || purchasing}
            onClick={() => handlePurchase(vehicle)}
          >
            {outOfStock ? "Out of stock" : purchasing ? "Purchasing…" : "Purchase"}
          </button>
          <section className="mt-8">
            <h2 className="font-display text-lg">Specifications</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {specs.map((row) => (
                <div key={row.label}>
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="font-medium tabular-nums">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
