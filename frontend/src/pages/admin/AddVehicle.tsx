import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVehicle } from "../../api/vehicles";
import { ApiError } from "../../api/client";
import { VehicleForm } from "../../components/VehicleForm";
import { useAuth } from "../../auth/AuthContext";
import type { VehicleInput, VehicleUpdateInput } from "../../types";
import { emptyVehicleFormValues } from "../../utils/vehicleFormModel";

export function AddVehiclePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: VehicleInput | VehicleUpdateInput) {
    setSubmitting(true);
    setError(null);
    setServerFieldErrors({});
    try {
      await createVehicle(payload as VehicleInput);
      navigate("/", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.fieldErrors) {
          setServerFieldErrors(caught.fieldErrors);
        }
        setError(caught.message);
      } else {
        setError("Failed to create vehicle.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-canvas">
        <div className="shell flex items-center justify-between py-4">
          <div>
            <p className="text-overline">Admin</p>
            <h1 className="font-display text-card-title tracking-tight text-ink">
              Add vehicle
            </h1>
            <p className="text-body text-muted">{user?.email}</p>
          </div>
        </div>
      </header>
      <main className="shell max-w-2xl py-8">
        {error && (
          <p className="mb-4 text-danger" role="alert">{error}</p>
        )}
        <VehicleForm
          mode="create"
          initialValues={useMemo(() => emptyVehicleFormValues(), [])}
          submitting={submitting}
          serverFieldErrors={serverFieldErrors}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}
