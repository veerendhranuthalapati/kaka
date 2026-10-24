import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVehicle,
  updateVehicle,
  deleteVehicle,
  restockVehicle,
} from "../../api/vehicles";
import { ApiError } from "../../api/client";
import { VehicleImage } from "../../components/VehicleImage";
import { FieldError, ConfirmDialog } from "../../components/State";
import { useAuth } from "../../auth/AuthContext";
import type { Vehicle } from "../../types";
import { validateImageUrl } from "../../utils/validation";

type FormState = {
  make: string;
  model: string;
  category: string;
  price: string;
  imageUrl: string;
};

export function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<FormState>({
    make: "",
    model: "",
    category: "",
    price: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState("10");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getVehicle(id);
        setVehicle(data);
        setForm({
          make: data.make,
          model: data.model,
          category: data.category,
          price: String(data.price),
          imageUrl: data.imageUrl ?? "",
        });
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

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setError(null);

    const price = Number(form.price);
    if (
      !form.make.trim() ||
      !form.model.trim() ||
      !form.category.trim() ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Check the vehicle details and try again.");
      setSubmitting(false);
      return;
    }

    const imageUrlError = validateImageUrl(form.imageUrl);
    if (imageUrlError) {
      setError(imageUrlError);
      setSubmitting(false);
      return;
    }

    try {
      await updateVehicle(id, {
        make: form.make.trim(),
        model: form.model.trim(),
        category: form.category.trim(),
        price,
        imageUrl: form.imageUrl.trim() ? form.imageUrl.trim() : null,
      });
      navigate("/", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
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
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Admin
            </p>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Edit vehicle
            </h1>
          </div>
          <span className="badge">{user?.email}</span>
        </div>
      </header>
      <main className="shell grid gap-6 py-6 sm:py-8">
        <section className="surface mx-auto w-full max-w-2xl p-6 sm:p-8">
          {loading && <p className="text-sm text-muted">Loading...</p>}
          {!loading && vehicle && (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="make">
                  Make
                </label>
                <input
                  id="make"
                  className="input"
                  value={form.make}
                  onChange={(event) => update("make", event.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="model">
                  Model
                </label>
                <input
                  id="model"
                  className="input"
                  value={form.model}
                  onChange={(event) => update("model", event.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  className="input"
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => update("price", event.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="imageUrl">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  className="input"
                  value={form.imageUrl}
                  onChange={(event) => update("imageUrl", event.target.value)}
                  maxLength={2048}
                />
                {form.imageUrl.trim() && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-line">
                    <VehicleImage src={form.imageUrl.trim()} alt="Image preview" />
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted">
                  Quantity: {vehicle.quantity} (managed via restock/purchase)
                </p>
              </div>
              <div className="sm:col-span-2">
                <FieldError message={error} />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </button>
              </div>
            </form>
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
              className="btn-secondary"
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
            className="btn-danger mt-4"
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
