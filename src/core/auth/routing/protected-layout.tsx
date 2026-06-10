// src/shared/layouts/ProtectedLayout.tsx
import { DashboardLayout } from "@/shared/components/dashboard-layout";
import { MobileLayout } from "@/core/auth/routing/mobile-layout";

export function ProtectedLayout() {
  return (
    <>
      <div className="hidden md:block">
        <DashboardLayout />
      </div>

      <div className="block md:hidden">
        <MobileLayout />
      </div>
    </>
  );
}