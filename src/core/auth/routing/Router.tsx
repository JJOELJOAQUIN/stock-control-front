import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "@/features/auth/ui/ProtectedRoute";


import Login from "@/features/login/ui/screens/Login";
import Tracking from "@/features/tracking/ui/screens/Tracking";
import Users from "@/features/users/ui/screens/Users";
import StockPage from "@/features/stock/ui/stock";

import CajaConsultorioPage from "@/features/caja/ui/caja-consultorio";
import MovimientosConsultorioPage from "@/features/movimientos/ui/movimientos-consultorio";
import { DashboardLayout } from "@/shared/components/dashboard-layout";
import NotFound404 from "@/shared/screen/404";
import HomeByContext from "@/features/home/ui/HomeByContext";

import HomeConsultorio from "@/features/home/ui/screens/HomeConsultorio";




export default function Router() {
  return (
    <Routes>
      {/* 🔐 LOGIN */}
      <Route path="/" element={<Login />} />

      {/* 🔐 DASHBOARD */}

      
      <Route path="/inicio" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<HomeConsultorio />} />
        <Route path="home" element={<HomeByContext />} />

        <Route path="seguimiento" element={<Tracking />} />
        <Route path="stock" element={<StockPage />} />
        
        <Route path="caja/consultorio" element={<CajaConsultorioPage />} />
        <Route path="movimientos-consultorio" element={<MovimientosConsultorioPage />} />

   
          <Route path="usuarios" element={<Users />} />
   
      </Route>
      {/* 404 */}
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}
