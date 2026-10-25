import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { AdminRoute } from "./components/AdminRoute";
import { AppLayout } from "./components/AppLayout";
import { AppShell } from "./components/AppShell";
import { PageRouteSkeleton } from "./components/PageRouteSkeleton";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { VehicleDataProvider } from "./data/VehicleDataProvider";
import { DashboardPage } from "./pages/Dashboard";

const LoginPage = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/Register").then((m) => ({ default: m.RegisterPage })),
);
const PhotoCreditsPage = lazy(() =>
  import("./pages/PhotoCredits").then((m) => ({ default: m.PhotoCreditsPage })),
);
const VehicleDetailsPage = lazy(() =>
  import("./pages/VehicleDetails").then((m) => ({ default: m.VehicleDetailsPage })),
);
const AddVehiclePage = lazy(() =>
  import("./pages/admin/AddVehicle").then((m) => ({ default: m.AddVehiclePage })),
);
const EditVehiclePage = lazy(() =>
  import("./pages/admin/EditVehicle").then((m) => ({ default: m.EditVehiclePage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFoundPage })),
);

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageRouteSkeleton />}>{children}</Suspense>;
}

export function App() {
  return (
    <AuthProvider>
      <VehicleDataProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/login"
              element={
                <Lazy>
                  <LoginPage />
                </Lazy>
              }
            />
            <Route
              path="/register"
              element={
                <Lazy>
                  <RegisterPage />
                </Lazy>
              }
            />
            <Route
              path="/credits"
              element={
                <Lazy>
                  <PhotoCreditsPage />
                </Lazy>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route
                  path="/vehicles/:id"
                  element={
                    <Lazy>
                      <VehicleDetailsPage />
                    </Lazy>
                  }
                />
                <Route element={<AdminRoute />}>
                  <Route
                    path="/admin/vehicles/new"
                    element={
                      <Lazy>
                        <AddVehiclePage />
                      </Lazy>
                    }
                  />
                  <Route
                    path="/admin/vehicles/:id/edit"
                    element={
                      <Lazy>
                        <EditVehiclePage />
                      </Lazy>
                    }
                  />
                </Route>
              </Route>
            </Route>
            <Route
              path="*"
              element={
                <Lazy>
                  <NotFoundPage />
                </Lazy>
              }
            />
          </Route>
        </Routes>
      </VehicleDataProvider>
    </AuthProvider>
  );
}
