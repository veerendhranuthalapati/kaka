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
  onApply: (filters: VehicleFilters) => void;
  onClear: () => void;
};

export function SearchFilters(_props: SearchFiltersProps) {
  return (
    <form>
      <input aria-label="Make" />
      <input aria-label="Model" />
      <input aria-label="Category" />
      <input aria-label="Minimum price" />
      <input aria-label="Maximum price" />
      <button type="button">Clear filters</button>
    </form>
  );
}
