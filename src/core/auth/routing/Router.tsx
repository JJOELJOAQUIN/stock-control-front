import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "@/features/auth/ui/ProtectedRoute";
import RoleGuard from "@/core/auth/guards/RoleGuard";
import Login from "@/features/login/ui/screens/Login";
import Tracking from "@/features/tracking/ui/screens/Tracking";
import Users from "@/features/users/ui/screens/Users";
import StockPage from "@/features/stock/ui/stock";

import CajaConsultorioPage from "@/features/caja/ui/caja-consultorio";
import MovimientosConsultorioPage from "@/features/movimientos/ui/movimientos-consultorio";
import MetricasPage from "@/features/metrics/ui/metricas-page";


import Tratamientos from "@/features/treatments/ui/screens/Tratamientos";


import NotFound404 from "@/shared/screen/404";
import HomeByContext from "@/features/home/ui/HomeByContext";
import HomeConsultorio from "@/features/home/ui/screens/HomeConsultorio";

import { ProtectedLayout } from "@/core/auth/routing/protected-layout";
import StockAlertasPage from "@/features/stock/ui/stock-alertas";
import StockConsumosPage from "@/features/stock/ui/stock-consumos";
import StockEscanearPage from "@/features/stock/ui/stock-escanear";
import VentaCombinadaPage from "@/features/caja/ui/venta-combinada-page";
import VentaDirectaPage from "@/features/caja/ui/venta-directa-page";
import PrecioEspecialPage from "@/features/caja/ui/precio-especial";
import ComprasPage from "@/features/caja/ui/compras-page";
import ProcedimientosPage from "@/features/treatments/ui/screens/ProcedimientosPage";
import MesoterapiasPage from "@/features/treatments/ui/screens/MesoterapiasPage";

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

        {/* ----------- Stock ----------- */}
        <Route path="stock" element={<StockPage />} />
        <Route path="stock/alertas" element={<StockAlertasPage />} />
        {/* Catalogo: hoy vive dentro de la pagina principal de stock; la ruta
            existe para que el submenu funcione, y la separacion total queda
            para cuando se parta stock.tsx. */}
        <Route path="stock/catalogo" element={<StockPage />} />
        <Route path="stock/consumos" element={<StockConsumosPage />} />
        <Route path="stock/escanear" element={<StockEscanearPage />} />

        {/* ----------- Caja ----------- */}
        <Route path="caja/consultorio" element={<CajaConsultorioPage />} />
        <Route path="caja/movimientos" element={<MovimientosConsultorioPage />} />
        <Route path="caja/metricas" element={<MetricasPage />} />
        <Route path="caja/venta-combinada" element={<VentaCombinadaPage />} />
        <Route path="caja/venta-directa" element={<VentaDirectaPage />} />
        <Route path="caja/precio-especial" element={<PrecioEspecialPage />} />

        <Route element={<RoleGuard allowedRoles={["ADMIN", "USER"]} redirectPath="/inicio" />}>
          <Route path="caja/compras" element={<ComprasPage />} />
          {/* Ruta vieja: quien tenga el link guardado cae en la nueva. */}
          <Route
            path="movimientos-consultorio"
            element={<Navigate to="/inicio/caja/movimientos" replace />}
          />
          {/* Usuarios: sin entrada en el menu, pero la ruta sigue viva. */}
          <Route path="usuarios" element={<Users />} />
        </Route>

        {/* ----------- Tratamientos ----------- */}
        <Route element={<RoleGuard allowedRoles={["ADMIN", "COSMETOLOGA"]} redirectPath="/inicio" />}>
          <Route path="tratamientos" element={<Navigate to="/inicio/tratamientos/peeling" replace />} />
          <Route path="tratamientos/peeling" element={<Tratamientos />} />
          <Route path="tratamientos/procedimientos" element={<ProcedimientosPage />} />
        </Route>
        <Route element={<RoleGuard allowedRoles={["ADMIN"]} redirectPath="/inicio" />}>
          <Route path="tratamientos/mesoterapias" element={<MesoterapiasPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}