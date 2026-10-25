import { lazy, Suspense } from "react";
import { RouteFade } from "./RouteFade";

const ScrollCar = lazy(() =>
  import("./scroll-car/ScrollCar").then((module) => ({ default: module.ScrollCar })),
);

export function AppShell() {
  return (
    <>
      <RouteFade />
      <Suspense fallback={null}>
        <ScrollCar />
      </Suspense>
    </>
  );
}
