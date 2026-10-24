import { useLocation, useOutlet } from "react-router-dom";

export function RouteFade() {
  const location = useLocation();
  const outlet = useOutlet();
  return (
    <div key={location.pathname} className="route-fade min-h-screen">
      {outlet}
    </div>
  );
}
