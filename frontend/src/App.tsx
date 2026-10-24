import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { AdminRoute } from "./components/AdminRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { NotFoundPage } from "./pages/NotFound";
import { AddVehiclePage } from "./pages/admin/AddVehicle";
import { EditVehiclePage } from "./pages/admin/EditVehicle";
import { VehicleDetailsPage } from "./pages/VehicleDetails";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/vehicles/new" element={<AddVehiclePage />} />
            <Route path="/admin/vehicles/:id/edit" element={<EditVehiclePage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
