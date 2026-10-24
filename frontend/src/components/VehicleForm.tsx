import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { VehicleInput, VehicleUpdateInput } from "../types";
import { AdminVehicleImageField } from "./AdminVehicleImageField";
import { FieldError } from "./State";
import {
  type VehicleFormValues,
  validateVehicleFormValues,
  buildVehicleSubmitPayload,
} from "../utils/vehicleFormModel";

const FUEL_OPTIONS = [
  "PETROL",
  "DIESEL",
  "ELECTRIC",
  "HYBRID",
  "PLUG_IN_HYBRID",
  "CNG",
  "LPG",
] as const;

const TRANSMISSION_OPTIONS = ["MANUAL", "AUTOMATIC", "CVT", "DCT"] as const;
const DRIVETRAIN_OPTIONS = ["FWD", "RWD", "AWD", "FOUR_WD"] as const;

export function VehicleForm({
  mode,
  initialValues,
  submitting,
  serverFieldErrors = {},
  onSubmit,
}: {
  mode: "create" | "edit";
  initialValues: VehicleFormValues;
  submitting: boolean;
  serverFieldErrors?: Record<string, string>;
  onSubmit: (payload: VehicleInput | VehicleUpdateInput) => Promise<void>;
}) {
  const [values, setValues] = useState<VehicleFormValues>(initialValues);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function update(field: keyof VehicleFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError(null);
  }

  function fieldError(field: keyof VehicleFormValues): string | undefined {
    return serverFieldErrors[field] ?? clientErrors[field];
  }

  const showEvFields =
    values.fuelType === "ELECTRIC" ||
    values.fuelType === "HYBRID" ||
    values.fuelType === "PLUG_IN_HYBRID";

  const [featureDraft, setFeatureDraft] = useState("");

  function addFeatureFromDraft() {
    const next = featureDraft.trim();
    if (!next) return;
    setValues((current) => ({
      ...current,
      features: current.features.includes(next)
        ? current.features
        : [...current.features, next],
    }));
    setFeatureDraft("");
    setClientErrors((current) => {
      const copy = { ...current };
      delete copy.features;
      return copy;
    });
  }

  function removeFeature(feature: string) {
    setValues((current) => ({
      ...current,
      features: current.features.filter((item) => item !== feature),
    }));
  }

  function handleFeatureKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addFeatureFromDraft();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateVehicleFormValues(values, {
      requireQuantity: mode === "create",
    });
    if (errors) {
      setClientErrors(errors);
      setFormError("Check the vehicle details and try again.");
      return;
    }
    setClientErrors({});
    setFormError(null);
    const payload = buildVehicleSubmitPayload(values, {
      requireQuantity: mode === "create",
    });
    await onSubmit(payload);
  }

  return (
    <form className="grid gap-8" onSubmit={handleSubmit}>
      {formError && (
        <p className="text-danger" role="alert">{formError}</p>
      )}

      <section className="grid gap-4">
        <h2 className="font-display text-lg">Basics</h2>
        <label className="label" htmlFor="vehicle-make">
          Make
          <input id="vehicle-make" className="input" value={values.make} onChange={(e) => update("make", e.target.value)} />
          <FieldError message={fieldError("make")} />
        </label>
        <label className="label" htmlFor="vehicle-model">
          Model
          <input id="vehicle-model" className="input" value={values.model} onChange={(e) => update("model", e.target.value)} />
          <FieldError message={fieldError("model")} />
        </label>
        <label className="label" htmlFor="vehicle-category">
          Category
          <input id="vehicle-category" className="input" value={values.category} onChange={(e) => update("category", e.target.value)} />
          <FieldError message={fieldError("category")} />
        </label>
        <label className="label" htmlFor="vehicle-price">
          Price
          <input id="vehicle-price" className="input" inputMode="decimal" value={values.price} onChange={(e) => update("price", e.target.value)} />
          <FieldError message={fieldError("price")} />
        </label>
        {mode === "create" && (
          <label className="label" htmlFor="vehicle-quantity">
            Quantity
            <input id="vehicle-quantity" className="input" inputMode="numeric" value={values.quantity} onChange={(e) => update("quantity", e.target.value)} />
            <FieldError message={fieldError("quantity")} />
          </label>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-lg">Specifications</h2>
        <p className="text-sm text-muted">All fields optional.</p>
        <label className="field">
          <span>Year</span>
          <input inputMode="numeric" value={values.year} onChange={(e) => update("year", e.target.value)} />
          <FieldError message={fieldError("year")} />
        </label>
        <label className="field">
          <span>Distance travelled (km)</span>
          <input inputMode="numeric" value={values.odometerKm} onChange={(e) => update("odometerKm", e.target.value)} />
          <FieldError message={fieldError("odometerKm")} />
        </label>
        <label className="field">
          <span>Engine (cc)</span>
          <input inputMode="numeric" value={values.engineCc} onChange={(e) => update("engineCc", e.target.value)} />
          <FieldError message={fieldError("engineCc")} />
        </label>
        <label className="field">
          <span>Power (bhp)</span>
          <input inputMode="numeric" value={values.powerBhp} onChange={(e) => update("powerBhp", e.target.value)} />
          <FieldError message={fieldError("powerBhp")} />
        </label>
        <label className="field">
          <span>Torque (Nm)</span>
          <input inputMode="numeric" value={values.torqueNm} onChange={(e) => update("torqueNm", e.target.value)} />
          <FieldError message={fieldError("torqueNm")} />
        </label>
        <label className="field">
          <span>Fuel type</span>
          <select value={values.fuelType} onChange={(e) => update("fuelType", e.target.value)}>
            <option value="">—</option>
            {FUEL_OPTIONS.map((option) => (
              <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
            ))}
          </select>
          <FieldError message={fieldError("fuelType")} />
        </label>
        <label className="field">
          <span>Transmission</span>
          <select value={values.transmission} onChange={(e) => update("transmission", e.target.value)}>
            <option value="">—</option>
            {TRANSMISSION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <FieldError message={fieldError("transmission")} />
        </label>
        <label className="field">
          <span>Drivetrain</span>
          <select value={values.drivetrain} onChange={(e) => update("drivetrain", e.target.value)}>
            <option value="">—</option>
            {DRIVETRAIN_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <FieldError message={fieldError("drivetrain")} />
        </label>
        <label className="field">
          <span>Mileage (km/l)</span>
          <input inputMode="decimal" value={values.fuelEconomyKmpl} onChange={(e) => update("fuelEconomyKmpl", e.target.value)} />
          <FieldError message={fieldError("fuelEconomyKmpl")} />
        </label>
        <label className="field">
          <span>Colour</span>
          <input value={values.color} onChange={(e) => update("color", e.target.value)} />
          <FieldError message={fieldError("color")} />
        </label>
        <label className="field">
          <span>Owners</span>
          <input inputMode="numeric" value={values.owners} onChange={(e) => update("owners", e.target.value)} />
          <FieldError message={fieldError("owners")} />
        </label>
        <label className="label" htmlFor="vehicle-vin">
          VIN
          <input id="vehicle-vin" className="input" value={values.vin} onChange={(e) => update("vin", e.target.value)} maxLength={17} />
          <FieldError message={fieldError("vin")} />
        </label>
        <label className="field">
          <span>Seats</span>
          <input inputMode="numeric" value={values.seats} onChange={(e) => update("seats", e.target.value)} />
          <FieldError message={fieldError("seats")} />
        </label>
        {showEvFields && (
          <>
            <label className="field">
              <span>Range (km)</span>
              <input inputMode="numeric" value={values.rangeKm} onChange={(e) => update("rangeKm", e.target.value)} />
              <FieldError message={fieldError("rangeKm")} />
            </label>
            <label className="field">
              <span>Battery (kWh)</span>
              <input inputMode="decimal" value={values.batteryKwh} onChange={(e) => update("batteryKwh", e.target.value)} />
              <FieldError message={fieldError("batteryKwh")} />
            </label>
          </>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-lg">Description &amp; features</h2>
        <label className="label" htmlFor="vehicle-description">
          Description
          <textarea
            id="vehicle-description"
            className="input min-h-[6rem]"
            maxLength={600}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <p className="text-sm text-muted">{values.description.length}/600</p>
          <FieldError message={fieldError("description")} />
        </label>
        <div>
          <label className="label" htmlFor="vehicle-feature-draft">
            Features
            <input
              id="vehicle-feature-draft"
              className="input"
              value={featureDraft}
              placeholder="Type a feature and press Enter"
              onChange={(e) => setFeatureDraft(e.target.value)}
              onKeyDown={handleFeatureKeyDown}
            />
          </label>
          {values.features.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {values.features.map((feature) => (
                <li key={feature} className="spec-chip flex items-center gap-1">
                  <span>{feature}</span>
                  <button
                    type="button"
                    className="text-muted hover:text-ink"
                    aria-label={`Remove ${feature}`}
                    onClick={() => removeFeature(feature)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <FieldError message={fieldError("features")} />
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-lg">Image</h2>
        <AdminVehicleImageField
          category={values.category}
          imageUrl={values.imageUrl}
          onImageUrlChange={(url) => update("imageUrl", url)}
        />
        <FieldError message={fieldError("imageUrl")} />
      </section>

      <button type="submit" className="btn-primary whitespace-nowrap" disabled={submitting}>
        {submitting
          ? "Saving..."
          : mode === "create"
            ? "Create vehicle"
            : "Save changes"}
      </button>
    </form>
  );
}
