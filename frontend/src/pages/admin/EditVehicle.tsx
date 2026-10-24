import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVehicle,
  updateVehicle,
  deleteVehicle,
  restockVehicle,
} from "../../api/vehicles";
import { ApiError } from "../../api/client";
import { VehicleForm } from "../../components/VehicleForm";
import { ConfirmDialog } from "../../components/State";
import { useAuth } from "../../auth/AuthContext";
import type { Vehicle, VehicleInput, VehicleUpdateInput } from "../../types";
import { vehicleToFormValues } from "../../utils/vehicleFormModel";

export function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [restockAmount, setRestockAmount] = useState("10");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getVehicle(id);
        setVehicle(data);
      } catch (caught) {
        if (caught instanceof ApiError) {
          setError(caught.message);
        } else {
          setError("Failed to load vehicle.");
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function handleSubmit(payload: VehicleInput | VehicleUpdateInput) {
    if (!id) return;
    setSubmitting(true);
    setError(null);
    setServerFieldErrors({});
    try {
      const updated = await updateVehicle(id, payload as VehicleUpdateInput);
      setVehicle(updated);
      navigate("/", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.fieldErrors) {
          setServerFieldErrors(caught.fieldErrors);
        }
        setError(caught.message);
      } else {
        setError("Failed to update vehicle.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRestock() {
    if (!id) return;
    const amount = Number(restockAmount);
    if (!Number.isInteger(amount) || amount < 1 || amount > 10000) {
      setError("Restock amount must be an integer between 1 and 10000.");
      return;
    }
    setRestocking(true);
    setError(null);
    try {
      const updated = await restockVehicle(id, amount);
      setVehicle(updated);
      setRestockAmount("10");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("Failed to restock vehicle.");
      }
    } finally {
      setRestocking(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteVehicle(id);
      navigate("/", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("Failed to delete vehicle.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-canvas">
        <div className="shell flex items-center justify-between py-4">
          <div>
            <p className="text-overline">Admin</p>
            <h1 className="font-display text-card-title tracking-tight text-ink">
              Edit vehicle
            </h1>
          </div>
          <span className="badge hidden lg:inline">{user?.email}</span>
        </div>
      </header>
      <main className="shell grid gap-6 py-6 sm:py-8">
        <section className="surface mx-auto w-full max-w-2xl p-6 sm:p-8">
          {loading && <p className="text-sm text-muted">Loading...</p>}
          {!loading && vehicle && (
            <>
              <p className="mb-4 text-sm text-muted">
                Quantity: {vehicle.quantity} (managed via restock/purchase)
              </p>
              {error && (
                <p className="mb-4 text-danger" role="alert">{error}</p>
              )}
              <VehicleForm
                key={vehicle.id}
                mode="edit"
                initialValues={vehicleToFormValues(vehicle)}
                submitting={submitting}
                serverFieldErrors={serverFieldErrors}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </section>

        <section className="surface mx-auto w-full max-w-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-ink">Restock inventory</h2>
          <p className="mt-1 text-sm text-muted">
            Add stock in whole units (1-10000).
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <div>
              <label className="label" htmlFor="restock">
                Amount
              </label>
              <input
                id="restock"
                className="input w-40"
                type="number"
                min="1"
                max="10000"
                step="1"
                value={restockAmount}
                onChange={(event) => setRestockAmount(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-secondary whitespace-nowrap"
              onClick={handleRestock}
              disabled={restocking}
            >
              {restocking ? "Restocking..." : "Restock"}
            </button>
          </div>
        </section>

        <section className="surface mx-auto w-full max-w-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-ink">Danger zone</h2>
          <p className="mt-1 text-sm text-muted">
            Deleting a vehicle cannot be undone.
          </p>
          <button
            type="button"
            className="btn-danger mt-4 whitespace-nowrap"
            onClick={() => setConfirmDelete(true)}
          >
            Delete vehicle
          </button>
        </section>
      </main>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this vehicle?"
        description="This action removes it from the inventory."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
