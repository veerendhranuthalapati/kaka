export function isSvgVehicleImageUrl(src: string): boolean {
  const path = src.split("?")[0]?.toLowerCase() ?? "";
  return path.endsWith(".svg");
}
