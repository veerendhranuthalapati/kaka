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

  const slideLabel = `${active.make} ${active.model}`;

  return (
    <section aria-label="Featured vehicles" className="relative">
      <div className="relative overflow-hidden rounded-[2rem] shadow-card">
        {vehicles.map((vehicle, slideIndex) => {
          const outOfStock = vehicle.quantity === 0;
          const purchasing = purchasingId === vehicle.id;
          const isActive = slideIndex === index;

          return (
            <article
              key={vehicle.id}
              className="relative w-full"
              hidden={!isActive}
            >
              <div className="relative aspect-[16/10] w-full max-h-[min(72vh,520px)] sm:aspect-[16/9]">
                <VehicleImage
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  loading={slideIndex === 0 ? "eager" : "lazy"}
                  className="h-full max-h-[min(72vh,520px)] rounded-[2rem]"
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-t from-ink/90 via-ink/45 to-ink/10"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className="absolute left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/90 text-lg text-ink shadow-float motion-reduce:transition-none hover:bg-white"
                  aria-label="Previous featured vehicle"
                  onClick={() => go(index - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/90 text-lg text-ink shadow-float motion-reduce:transition-none hover:bg-white"
                  aria-label="Next featured vehicle"
                  onClick={() => go(index + 1)}
                >
                  →
                </button>

                <div
                  className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 p-6 pb-8 text-white sm:p-10 sm:pb-10"
                >
                  <div
                    className="flex justify-center gap-2 pb-2"
                    role="tablist"
                    aria-label="Featured vehicle slides"
                  >
                    {vehicles.map((dotVehicle, dotIndex) => (
                      <button
                        key={dotVehicle.id}
                        type="button"
                        role="tab"
                        aria-selected={dotIndex === index}
                        aria-label={`${dotVehicle.make} ${dotVehicle.model}`}
                        className={`h-2 rounded-full transition-all motion-reduce:transition-none ${
                          dotIndex === index
                            ? "w-7 bg-white"
                            : "w-2 bg-white/50"
                        }`}
                        onClick={() => go(dotIndex)}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                    {vehicle.category}
                  </span>
                  <h2 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                    {vehicle.make} {vehicle.model}
                  </h2>
                  <p className="text-xl font-semibold sm:text-2xl">
                    {formatPrice(vehicle.price)}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      className="btn-primary min-w-[10rem] rounded-full px-6"
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
                      className="btn-hero-secondary min-w-[10rem] rounded-full px-6"
                      onClick={() => onDetails(vehicle)}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="sr-only" role="status">{slideLabel}</p>
    </section>
  );
}
