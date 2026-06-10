import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "@/features/auth/ui/ProtectedRoute";
import Login from "@/features/login/ui/screens/Login";
import Tracking from "@/features/tracking/ui/screens/Tracking";
import Users from "@/features/users/ui/screens/Users";
import StockPage from "@/features/stock/ui/stock";

import CajaConsultorioPage from "@/features/caja/ui/caja-consultorio";
import MovimientosConsultorioPage from "@/features/movimientos/ui/movimientos-consultorio";
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
        <Route path="movimientos-consultorio" element={<MovimientosConsultorioPage />} />
        <Route path="usuarios" element={<Users />} />
      </Route>

      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}