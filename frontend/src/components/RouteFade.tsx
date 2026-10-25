import { useLocation, useOutlet } from "react-router-dom";
import { ContentLoadingGuard } from "./ContentLoadingGuard";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

export function RouteFade() {
  const location = useLocation();
  const outlet = useOutlet();
  return (
    <RouteErrorBoundary>
      <div key={location.pathname} className="route-fade min-h-screen">
        <ContentLoadingGuard>{outlet}</ContentLoadingGuard>
      </div>
    </RouteErrorBoundary>
  );
}
