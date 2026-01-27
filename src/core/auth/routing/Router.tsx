import ProtectedRoute from "@/features/auth/ui/ProtectedRoute";
import Home from "@/features/home/ui/Home";
import Login from "@/features/login/ui/screens/Login";
import Tracking from "@/features/tracking/ui/screens/Tracking";
import Users from "@/features/users/ui/screens/Users";
import { DashboardLayout } from "@/shared/components/dashboard-layout";
import NotFound404 from "@/shared/screen/404";

import { Routes, Route } from "react-router-dom";
import RoleGuard from "../guards/RoleGuard";
import Commercial from "@/features/commercial/ui/screen/commercial";
import CommercialDetail from "@/features/commercial/ui/screen/commercial-detail";
import CommercialAdminPanel from "@/features/commercial/ui/screen/commercial-admin-panel";
import CommercialAnalysisClient from "@/features/commercial/ui/screen/commercial-analysis-clients";

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
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Dashboard */}
      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="seguimiento" element={<Tracking />} />
        <Route path="commercial/:id" element={<Commercial />} />
        <Route path="commercial" element={<CommercialAdminPanel />} />
        <Route path="commercial/analysis" element={<CommercialAnalysisClient />} />
        <Route path="commercial/client/:id" element={<CommercialDetail />} />
        <Route element={<RoleGuard allowedRoles={rolesConfig.users} />}>
          <Route path="usuarios" element={<Users />} />
        </Route>
      </Route>

      {/* 404 AL FINAL */}
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}
