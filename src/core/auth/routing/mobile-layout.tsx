// src/shared/layouts/MobileLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Package, DollarSign, Users, Activity } from "lucide-react";

import { useAuth } from "@/core/auth/context/AuthProvider";
import { MobileTopNav } from "@/shared/components/mobile-top-nav";
import { MobileBottomNav } from "@/shared/components/mobile-bottom-nav";

const ADMIN_NAV_ITEMS = [
  { id: "/inicio", icon: Home, label: "Inicio" },
  { id: "/inicio/stock", icon: Package, label: "Stock" },
  { id: "/inicio/caja/consultorio", icon: DollarSign, label: "Caja" },
  { id: "/inicio/movimientos-consultorio", icon: Activity, label: "Mov." },
  { id: "/inicio/usuarios", icon: Users, label: "Usuarios" },
];

const COSMETOLOGA_NAV_ITEMS = [
  { id: "/inicio", icon: Home, label: "Inicio" },
  { id: "/inicio/caja/consultorio", icon: DollarSign, label: "Caja" },
  { id: "/inicio/movimientos-consultorio", icon: Activity, label: "Mov." },
];

export function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  const isAdmin = authState.roles.includes("ADMIN");

  const navItems = isAdmin ? ADMIN_NAV_ITEMS : COSMETOLOGA_NAV_ITEMS;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileTopNav onBack={() => window.history.back()} />

      <main className="flex-1 overflow-y-auto px-4 pt-16 pb-24">
        <Outlet />
      </main>

      <MobileBottomNav
        navItems={navItems}
        currentPath={location.pathname}
        onNavigate={(to) => navigate(to)}
      />
    </div>
  );
}