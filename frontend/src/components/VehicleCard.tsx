import { Link } from "react-router-dom";
import type { Vehicle } from "../types";
import { formatPrice } from "../utils/format";

export type VehicleCardProps = {
  vehicle: Vehicle;
  canManage?: boolean;
  purchasing?: boolean;
  onPurchase?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
};

export function VehicleCard({
  vehicle,
  canManage = false,
  purchasing = false,
  onPurchase,
  onRestock,
  onDelete,
}: VehicleCardProps) {
  const name = `${vehicle.make} ${vehicle.model}`;
  const outOfStock = vehicle.quantity === 0;
  const actionLabel = purchasing
    ? "Purchasing..."
    : outOfStock
      ? "Out of stock"
      : "Purchase";

  return (
    <article className="surface flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="badge">{vehicle.category}</span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
              outOfStock ? "text-danger" : "text-accent"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${
                outOfStock ? "bg-danger" : "bg-accent"
              }`}
            />
            {outOfStock ? "Out of stock" : `${vehicle.quantity} available`}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">{name}</h2>
          <p className="mt-1 text-sm text-muted">
            {vehicle.make} · {vehicle.category}
          </p>
        </div>

        <div className="mt-auto">
          <p className="text-2xl font-bold tracking-tight text-ink">
            {formatPrice(vehicle.price)}
          </p>
          <p className="mt-1 text-xs text-muted">Price includes dealer prep</p>
        </div>

        <button
          type="button"
          className="btn-primary w-full"
          disabled={outOfStock || purchasing}
          aria-busy={purchasing}
          onClick={() => onPurchase?.(vehicle)}
        >
          {purchasing && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
            />
          )}
          {actionLabel}
        </button>
      </div>

      {canManage && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-raised/50 px-5 py-3 sm:px-6">
          <span className="mr-auto text-xs font-semibold uppercase tracking-widest text-muted">
            Manage
          </span>
          <Link
            to={`/admin/vehicles/${vehicle.id}/edit`}
            className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
            aria-label={`Edit ${name}`}
          >
            Edit
          </Link>
          <button
            type="button"
            className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
            aria-label={`Restock ${name}`}
            onClick={() => onRestock?.(vehicle)}
          >
            Restock
          </button>
          <button
            type="button"
            className="btn-danger min-h-9 px-3 py-1.5 text-xs"
            aria-label={`Delete ${name}`}
            onClick={() => onDelete?.(vehicle)}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
