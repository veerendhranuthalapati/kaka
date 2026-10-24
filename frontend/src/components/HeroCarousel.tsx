import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Vehicle } from "../types";
import { formatPrice } from "../utils/format";
import {
  HERO_CATEGORY_PILL_BG,
  HERO_DETAILS_BTN_BG,
  HERO_DETAILS_BTN_BG_HOVER,
  HERO_DETAILS_BTN_BORDER,
  HERO_DOT_ACTIVE,
  HERO_DOT_INACTIVE,
  HERO_DOTS_PILL_BG,
  HERO_ARROW_BTN_BG,
  HERO_ARROW_BTN_BORDER,
  HERO_SCRIM_BOTTOM,
  HERO_SCRIM_LEFT,
  HERO_TITLE_SHADOW,
} from "../utils/heroOverlayTheme";
import { VehicleImage } from "./VehicleImage";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <path d="M15 6l-6 6 6 6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

export type HeroCarouselProps = {
  vehicles: Vehicle[];
  purchasingId: string | null;
  onPurchase: (vehicle: Vehicle) => void;
};

export function HeroCarousel({
  vehicles,
  purchasingId,
  onPurchase,
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
      <div className="relative overflow-hidden rounded-card shadow-lift">
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
                  category={vehicle.category}
                  vehicleId={vehicle.id}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  loading={slideIndex === 0 ? "eager" : "lazy"}
                  layout="hero"
                  fixedAspect={false}
                  className="h-full max-h-[min(72vh,520px)] rounded-[2rem]"
                />
                <div
                  className="hero-scrim-bottom pointer-events-none absolute inset-0 rounded-[2rem]"
                  style={{ background: HERO_SCRIM_BOTTOM }}
                  aria-hidden="true"
                  data-hero-scrim="bottom"
                />
                <div
                  className="hero-scrim-left pointer-events-none absolute inset-0 rounded-[2rem]"
                  style={{ background: HERO_SCRIM_LEFT }}
                  aria-hidden="true"
                  data-hero-scrim="left"
                />

                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 p-6 pb-6 sm:p-8 sm:pb-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div
                      className="hero-text-zone min-w-0 max-w-[min(100%,42rem)] flex flex-col gap-3 text-white sm:gap-3.5"
                      data-hero-text-zone
                    >
                      <span
                        className="inline-flex w-fit rounded-chip px-2.5 py-1 font-sans text-label normal-case tracking-widest text-white"
                        style={{ backgroundColor: HERO_CATEGORY_PILL_BG }}
                      >
                        {vehicle.category}
                      </span>
                      <h2
                        className="max-w-3xl font-display text-hero text-white"
                        style={{ textShadow: HERO_TITLE_SHADOW }}
                      >
                        {vehicle.make} {vehicle.model}
                      </h2>
                      <p
                        className="font-display text-2xl font-bold tabular-nums text-white"
                        style={{ textShadow: HERO_TITLE_SHADOW }}
                      >
                        {formatPrice(vehicle.price)}
                      </p>
                      <div className="flex flex-wrap gap-3 pt-0.5">
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
                        <Link
                          className="inline-flex min-h-11 min-w-[10rem] items-center justify-center rounded-full border px-6 text-center text-sm font-semibold text-white transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                          style={{
                            backgroundColor: HERO_DETAILS_BTN_BG,
                            borderColor: HERO_DETAILS_BTN_BORDER,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              HERO_DETAILS_BTN_BG_HOVER;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              HERO_DETAILS_BTN_BG;
                          }}
                          to={`/vehicles/${vehicle.id}`}
                        >
                          Details
                        </Link>
                      </div>
                    </div>

                    <div
                      className="hero-control-zone flex shrink-0 flex-col items-end gap-3 self-end sm:self-auto"
                      data-hero-control-zone
                    >
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full border text-white motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                          style={{
                            backgroundColor: HERO_ARROW_BTN_BG,
                            borderColor: HERO_ARROW_BTN_BORDER,
                          }}
                          aria-label="Previous featured vehicle"
                          onClick={() => go(index - 1)}
                        >
                          <ChevronIcon direction="left" />
                        </button>
                        <button
                          type="button"
                          className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full border text-white motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                          style={{
                            backgroundColor: HERO_ARROW_BTN_BG,
                            borderColor: HERO_ARROW_BTN_BORDER,
                          }}
                          aria-label="Next featured vehicle"
                          onClick={() => go(index + 1)}
                        >
                          <ChevronIcon direction="right" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className="hero-dots-zone flex justify-start sm:max-w-[min(100%,42rem)]"
                    data-hero-dots-zone
                  >
                    <div
                      className="inline-flex items-center gap-1 rounded-chip px-3 py-2"
                      style={{ backgroundColor: HERO_DOTS_PILL_BG }}
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
                          className="min-h-11 min-w-11 rounded-full p-2 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                          onClick={() => go(dotIndex)}
                        >
                          <span
                            className="block rounded-full transition-all motion-reduce:transition-none"
                            style={{
                              backgroundColor:
                                dotIndex === index
                                  ? HERO_DOT_ACTIVE
                                  : HERO_DOT_INACTIVE,
                              width: dotIndex === index ? "1.75rem" : "0.5rem",
                              height: "0.5rem",
                              margin: "0 auto",
                            }}
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
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
