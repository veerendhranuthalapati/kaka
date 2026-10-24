import { useCallback, useEffect, useState } from "react";
import type { Vehicle } from "../types";
import { formatPrice } from "../utils/format";
import { VehicleImage } from "./VehicleImage";

export type HeroCarouselProps = {
  vehicles: Vehicle[];
  purchasingId: string | null;
  onPurchase: (vehicle: Vehicle) => void;
  onDetails: (vehicle: Vehicle) => void;
};

export function HeroCarousel({
  vehicles,
  purchasingId,
  onPurchase,
  onDetails,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = vehicles.length;
  const active = vehicles[index];

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(Math.max(0, Math.min(count - 1, next)));
    },
    [count],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        go(index + 1);
      }
      if (event.key === "ArrowLeft") {
        go(index - 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, index]);

  if (!active) {
    return null;
  }

  const outOfStock = active.quantity === 0;
  const purchasing = purchasingId === active.id;
  const slideLabel = `${active.make} ${active.model}`;

  return (
    <section
      aria-label="Featured vehicles"
      className="relative"
    >
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth motion-reduce:scroll-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {vehicles.map((vehicle, slideIndex) => (
            <article
              key={vehicle.id}
              className="relative min-w-full snap-center"
              hidden={slideIndex !== index}
            >
              <div className="relative aspect-[16/9] max-h-[420px] w-full sm:aspect-[16/9] md:max-h-none">
                <VehicleImage
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-full max-h-[420px] md:max-h-[480px] rounded-3xl"
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-ink/80 via-ink/35 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 text-white sm:p-8">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    {vehicle.category}
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {vehicle.make} {vehicle.model}
                  </h2>
                  <p className="text-lg font-semibold sm:text-xl">
                    {formatPrice(vehicle.price)}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="btn-primary min-w-[9rem]"
                      disabled={outOfStock || purchasing}
                      aria-busy={purchasing}
                      onClick={() => onPurchase(vehicle)}
                    >
                      {purchasing
                        ? "Purchasing..."
                        : outOfStock
                          ? "Out of stock"
                          : "Purchase"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20"
                      onClick={() => onDetails(vehicle)}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          className="btn-secondary min-h-10 px-3"
          aria-label="Previous featured vehicle"
          onClick={() => go(index - 1)}
        >
          ←
        </button>
        <div className="flex flex-1 justify-center gap-2" role="tablist">
          {vehicles.map((vehicle, dotIndex) => (
            <button
              key={vehicle.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`${vehicle.make} ${vehicle.model}`}
              className={`h-2.5 rounded-full transition-all motion-reduce:transition-none ${
                dotIndex === index ? "w-8 bg-accent" : "w-2.5 bg-line"
              }`}
              onClick={() => go(dotIndex)}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn-secondary min-h-10 px-3"
          aria-label="Next featured vehicle"
          onClick={() => go(index + 1)}
        >
          →
        </button>
      </div>
      <p className="sr-only" role="status">{slideLabel}</p>
    </section>
  );
}
