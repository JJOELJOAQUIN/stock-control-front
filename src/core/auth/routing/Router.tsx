import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "@/features/auth/ui/ProtectedRoute";
import RoleGuard from "@/core/auth/guards/RoleGuard";
import Login from "@/features/login/ui/screens/Login";
import Tracking from "@/features/tracking/ui/screens/Tracking";
import Users from "@/features/users/ui/screens/Users";
import StockPage from "@/features/stock/ui/stock";

import CajaConsultorioPage from "@/features/caja/ui/caja-consultorio";
import MovimientosConsultorioPage from "@/features/movimientos/ui/movimientos-consultorio";
import Tratamientos from "@/features/treatments/ui/screens/Tratamientos";
import NotFound404 from "@/shared/screen/404";
import HomeByContext from "@/features/home/ui/HomeByContext";
import HomeConsultorio from "@/features/home/ui/screens/HomeConsultorio";

import { ProtectedLayout } from "@/core/auth/routing/protected-layout";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeConsultorio />} />
        <Route path="home" element={<HomeByContext />} />
        <Route path="seguimiento" element={<Tracking />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="caja/consultorio" element={<CajaConsultorioPage />} />

        {/* Tratamientos: médica (ADMIN) y cosmetóloga. */}
        <Route element={<RoleGuard allowedRoles={["ADMIN", "COSMETOLOGA"]} redirectPath="/inicio" />}>
          <Route path="tratamientos" element={<Tratamientos />} />
        </Route>

        {/* Rutas restringidas: ocultas en el menú para COSMETOLOGA
            y bloqueadas también por URL (si la tipea, vuelve a /inicio). */}
        <Route element={<RoleGuard allowedRoles={["ADMIN", "USER"]} redirectPath="/inicio" />}>
          <Route path="movimientos-consultorio" element={<MovimientosConsultorioPage />} />
          <Route path="usuarios" element={<Users />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}