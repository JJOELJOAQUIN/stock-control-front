import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "@/features/auth/ui/ProtectedRoute";
import RoleGuard from "../guards/RoleGuard";

import Login from "@/features/login/ui/screens/Login";
import Tracking from "@/features/tracking/ui/screens/Tracking";
import Users from "@/features/users/ui/screens/Users";
import StockPage from "@/features/stock/ui/stock";
import CajaLocalPage from "@/features/caja/ui/caja-local";
import CajaConsultorioPage from "@/features/caja/ui/caja-consultorio";
import MovimientosConsultorioPage from "@/features/movimientos/ui/movimientos-consultorio";
import { DashboardLayout } from "@/shared/components/dashboard-layout";
import NotFound404 from "@/shared/screen/404";
import HomeByContext from "@/features/home/ui/HomeByContext";
import Home from "@/features/home/ui/ContextSelector";

enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

const rolesConfig: Record<string, Role[]> = {
  home: [Role.ADMIN, Role.USER],
  tracking: [Role.ADMIN, Role.USER],
  users: [Role.ADMIN],
};

export default function Router() {
  return (
    <Routes>
      {/* 🔐 LOGIN */}
      <Route path="/" element={<Login />} />

      {/* 🔐 DASHBOARD */}

      
      <Route path="/inicio" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="home" element={<HomeByContext />} />

        <Route path="seguimiento" element={<Tracking />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="caja/local" element={<CajaLocalPage />} />
        <Route path="caja/consultorio" element={<CajaConsultorioPage />} />
        <Route path="movimientos-consultorio" element={<MovimientosConsultorioPage />} />

        {/* admin */}
        <Route element={<RoleGuard allowedRoles={rolesConfig.users} />}>
          <Route path="usuarios" element={<Users />} />
        </Route>
      </Route>
      {/* 404 */}
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}
