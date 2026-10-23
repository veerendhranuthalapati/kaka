import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createVehicle } from "../../api/vehicles";
import { ApiError } from "../../api/client";
import { FieldError } from "../../components/State";
import { useAuth } from "../../auth/AuthContext";

type FormState = {
  make: string;
  model: string;
  category: string;
  price: string;
  quantity: string;
};

const initialState: FormState = {
  make: "",
  model: "",
  category: "",
  price: "",
  quantity: "",
};

export function AddVehiclePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (
      !form.make.trim() ||
      !form.model.trim() ||
      !form.category.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      form.make.length > 100 ||
      form.model.length > 100 ||
      form.category.length > 100
    ) {
      setError("Check the vehicle details and try again.");
      setSubmitting(false);
      return;
    }

    try {
      await createVehicle({
        make: form.make.trim(),
        model: form.model.trim(),
        category: form.category.trim(),
        price,
        quantity,
      });
      navigate("/", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
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
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Admin
            </p>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Add vehicle
            </h1>
          </div>
          <span className="badge">{user?.email}</span>
        </div>
      </header>
      <main className="shell py-6 sm:py-8">
        <section className="surface mx-auto w-full max-w-2xl p-6 sm:p-8">
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
            <div>
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
            <div>
              <label className="label" htmlFor="quantity">
                Quantity
              </label>
              <input
                id="quantity"
                className="input"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={(event) => update("quantity", event.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <FieldError message={error} />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Create vehicle"}
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
        </section>
      </main>
    </div>
  );
}
