import { VehicleImage } from "./VehicleImage";

export type AdminVehicleImageFieldProps = {
  imageUrl: string;
  category: string;
  onImageUrlChange: (value: string) => void;
};

export function AdminVehicleImageField({
  imageUrl,
  category,
  onImageUrlChange,
}: AdminVehicleImageFieldProps) {
  return (
    <div className="sm:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <label className="label mb-0" htmlFor="imageUrl">
          Image URL (optional)
        </label>
        {imageUrl.trim() && (
          <button
            type="button"
            className="text-sm font-medium text-accent hover:underline"
            onClick={() => onImageUrlChange("")}
          >
            Clear
          </button>
        )}
      </div>
      <input
        id="imageUrl"
        className="input"
        placeholder="/cars/sedan-01.svg"
        value={imageUrl}
        onChange={(event) => onImageUrlChange(event.target.value)}
        maxLength={2048}
      />
      <p className="mt-1 text-xs text-muted">
        Leave empty to use a category illustration. https:// or a site path such
        as /cars/sedan-01.svg (max 2048 characters).
      </p>
      <div
        className="mt-3 overflow-hidden rounded-2xl border border-line"
        data-testid="vehicle-image-preview"
      >
        <VehicleImage
          src={imageUrl.trim() ? imageUrl.trim() : null}
          category={category}
          vehicleId="admin-preview"
          alt="Image preview"
        />
      </div>
    </div>
  );
}
