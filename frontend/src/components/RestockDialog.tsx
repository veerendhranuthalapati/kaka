import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Vehicle } from "../types";

export type RestockDialogProps = {
  vehicle: Vehicle | null;
  onRestock: (vehicle: Vehicle, amount: number) => Promise<void>;
  onClose: () => void;
};

export function RestockDialog({
  vehicle,
  onRestock,
  onClose,
}: RestockDialogProps) {
  const [amount, setAmount] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vehicle) return;
    setAmount("10");
    setError(null);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [vehicle, onClose]);

  if (!vehicle) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vehicle) return;
    const parsed = Number(amount);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10000) {
      setError("Amount must be a whole number between 1 and 10,000.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onRestock(vehicle, parsed);
      onClose();
    } catch {
      setError("Failed to restock vehicle. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restock-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="surface relative z-10 w-full max-w-md p-6"
      >
        <h2 id="restock-title" className="text-lg font-semibold text-ink">
          Restock {vehicle.make} {vehicle.model}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Current inventory: {vehicle.quantity} units. Add 1 to 10,000 units.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4" noValidate>
          <div>
            <label className="label" htmlFor="restock-amount">
              Restock amount
            </label>
            <input
              id="restock-amount"
              className="input"
              type="number"
              min="1"
              max="10000"
              step="1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-danger" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Restocking..." : "Restock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
