// src/core/auth/routing/mobile-layout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/core/auth/context/AuthProvider";
import { MobileTopNav } from "@/shared/components/mobile-top-nav";
import { MobileBottomNav } from "@/shared/components/mobile-bottom-nav";
import { NAV_ITEMS, filterNavByRoles } from "@/shared/navigation/nav-items";

export function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  // Misma fuente única que el sidebar desktop => sin drift entre layouts.
  const navItems = filterNavByRoles(NAV_ITEMS, authState.roles)
    .filter((item) => item.showInMobile !== false)
    .map((item) => ({
      id: item.href,
      icon: item.mobileIcon ?? item.icon,
      label: item.mobileLabel ?? item.label,
    }));

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