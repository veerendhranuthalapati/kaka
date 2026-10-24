import { useEffect, useRef } from "react";
import type { Vehicle } from "../types";
import { formatPrice } from "../utils/format";
import { VehicleImage } from "./VehicleImage";

export function VehicleDetailsDialog({
  vehicle,
  open,
  onClose,
}: {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !vehicle) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${vehicle.make} ${vehicle.model} details`}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
    >
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        className="surface relative z-10 grid max-h-[90vh] w-full max-w-2xl gap-4 overflow-y-auto p-6 sm:grid-cols-2"
      >
        <VehicleImage
          src={vehicle.imageUrl}
          category={vehicle.category}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="rounded-2xl"
        />
        <div className="flex flex-col gap-3">
          <p className="badge self-start">{vehicle.category}</p>
          <h2 className="text-2xl font-bold tracking-tight">
            {vehicle.make} {vehicle.model}
          </h2>
          <p className="text-xl font-semibold">{formatPrice(vehicle.price)}</p>
          <dl className="grid gap-2 text-sm text-muted">
            <div className="flex justify-between gap-4 border-b border-line py-2">
              <dt>Stock</dt>
              <dd className="font-semibold text-ink">{vehicle.quantity}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line py-2">
              <dt>Updated</dt>
              <dd>{new Date(vehicle.updatedAt).toLocaleString()}</dd>
            </div>
            {vehicle.imageUrl && (
              <div className="flex flex-col gap-1 border-b border-line py-2">
                <dt>Image URL</dt>
                <dd className="break-all text-ink">{vehicle.imageUrl}</dd>
              </div>
            )}
          </dl>
          <button type="button" className="btn-secondary mt-auto" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
