type ImportFn = () => Promise<unknown>;

const prefetched = new Set<string>();

export function prefetchRouteChunk(key: string, importer: ImportFn): void {
  if (prefetched.has(key)) return;
  prefetched.add(key);
  void importer();
}

export function prefetchVehicleDetails(
  vehicleId: string,
  loaders: { route: ImportFn; data?: (id: string) => Promise<unknown> },
): void {
  prefetchRouteChunk(`vehicle-details-route`, loaders.route);
  if (loaders.data) {
    void loaders.data(vehicleId);
  }
}

export function resetPrefetchForTests(): void {
  prefetched.clear();
}
