import { useEffect, useId, useRef, useState } from "react";
import type { VehicleSearchParams } from "../types";

export type VehicleFilters = {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
};

export const EMPTY_FILTERS: VehicleFilters = {
  make: "",
  model: "",
  category: "",
  minPrice: "",
  maxPrice: "",
};

export type SearchFiltersProps = {
  onApply: (filters: VehicleSearchParams) => void;
  onClear: () => void;
  disabled?: boolean;
};

function toCriteria(filters: VehicleFilters): VehicleSearchParams {
  const criteria: VehicleSearchParams = {};
  const make = filters.make.trim();
  const model = filters.model.trim();
  const category = filters.category.trim();

  if (make) criteria.make = make;
  if (model) criteria.model = model;
  if (category) criteria.category = category;
  if (filters.minPrice.trim()) criteria.minPrice = Number(filters.minPrice);
  if (filters.maxPrice.trim()) criteria.maxPrice = Number(filters.maxPrice);

  return criteria;
}

function priceError(filters: VehicleFilters): string | null {
  const min = filters.minPrice.trim();
  const max = filters.maxPrice.trim();

  if (min && !Number.isFinite(Number(min))) {
    return "Enter a valid minimum price.";
  }

  if (max && !Number.isFinite(Number(max))) {
    return "Enter a valid maximum price.";
  }

  if (min && max && Number(min) > Number(max)) {
    return "Minimum price cannot exceed maximum price.";
  }

  return null;
}

export function SearchFilters({
  onApply,
  onClear,
  disabled = false,
}: SearchFiltersProps) {
  const id = useId();
  const [filters, setFilters] = useState<VehicleFilters>(EMPTY_FILTERS);
  const firstRender = useRef(true);
  const skipNextApply = useRef(false);
  const error = priceError(filters);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (error) {
      return;
    }

    if (skipNextApply.current) {
      skipNextApply.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      if (priceError(filters)) return;
      onApply(toCriteria(filters));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [error, filters, onApply]);

  function update(field: keyof VehicleFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function clear() {
    if (Object.values(filters).some((value) => value.length > 0)) {
      skipNextApply.current = true;
    }
    setFilters(EMPTY_FILTERS);
    onClear();
  }

  return (
    <form
      className="surface p-4 sm:p-5"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (!error) onApply(toCriteria(filters));
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label" htmlFor={`${id}-make`}>
            Make
          </label>
          <input
            id={`${id}-make`}
            className="input"
            placeholder="Toyota"
            value={filters.make}
            onChange={(event) => update("make", event.target.value)}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-model`}>
            Model
          </label>
          <input
            id={`${id}-model`}
            className="input"
            placeholder="Corolla"
            value={filters.model}
            onChange={(event) => update("model", event.target.value)}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-category`}>
            Category
          </label>
          <input
            id={`${id}-category`}
            className="input"
            placeholder="Sedan, SUV..."
            value={filters.category}
            onChange={(event) => update("category", event.target.value)}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-min`}>
            Minimum price
          </label>
          <input
            id={`${id}-min`}
            className="input"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="0"
            value={filters.minPrice}
            onChange={(event) => update("minPrice", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-max`}>
            Maximum price
          </label>
          <input
            id={`${id}-max`}
            className="input"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(event) => update("maxPrice", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p
          id={`${id}-error`}
          role={error ? "alert" : undefined}
          className={`text-sm font-medium ${error ? "text-danger" : "text-muted"}`}
          aria-live="polite"
        >
          {error ?? "Results update automatically as you type."}
        </p>
        <button
          type="button"
          className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
          onClick={clear}
          disabled={disabled}
        >
          Clear filters
        </button>
      </div>
    </form>
  );
}
