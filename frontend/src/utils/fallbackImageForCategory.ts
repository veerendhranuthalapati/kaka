const CATEGORY_ILLUSTRATIONS: Record<string, string> = {
  suv: "/cars/suv-01.svg",
  sedan: "/cars/sedan-01.svg",
  truck: "/cars/truck-01.svg",
  hatchback: "/cars/hatch-01.svg",
  coupe: "/cars/coupe-01.svg",
  ev: "/cars/ev-01.svg",
  electric: "/cars/ev-01.svg",
  wagon: "/cars/wagon-01.svg",
};

const DEFAULT_ILLUSTRATION = "/cars/placeholder.svg";

export function fallbackImageForCategory(category: string): string {
  const key = category.trim().toLowerCase();
  if (!key) {
    return DEFAULT_ILLUSTRATION;
  }
  return CATEGORY_ILLUSTRATIONS[key] ?? DEFAULT_ILLUSTRATION;
}
