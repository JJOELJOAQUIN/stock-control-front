import StatCard from "@/shared/components/ui/charts/stat-card/stat-card";
import { useDashboardHome } from "../../services/useDashboardHome";

import { Package, Undo2, CheckCircle, Boxes, Truck, Clock } from "lucide-react";
import { ErrorStatCard } from "@/shared/components/ui/charts/stat-card/stat-error-card";
import { SkeletonStatCard } from "@/shared/components/ui/charts/stat-card/stat-skeleton-card";

const stateIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  ARMADO: Package,
  DEVOLUCION: Undo2,
  DISPENSADO: CheckCircle,
  DISPONIBLE: Boxes,
  "EN TRANSITO": Truck,
  PENDIENTE: Clock,
};

const HomeTracking = () => {
  const {summary , cash,  isLoading, isError } = useDashboardHome();

  const countsWithIcons = summary?.counts.map((item) => ({
    ...item,
    icon: stateIcons[item.state] ?? Package,
  }));

  return (
    <div>
      {isError && (
        <div className="grid grid-cols-6 gap-4">
          {Object.keys(stateIcons).map((key) => (
            <div key={key} className="w-full">
              <ErrorStatCard />
            </div>
          ))}
        </div>
      )}
      {isLoading && (
        <div className="grid grid-cols-6 gap-4">
          {Object.keys(stateIcons).map((key) => (
            <div key={key} className="w-full">
              <SkeletonStatCard />
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-6 gap-4">
        {countsWithIcons &&
          countsWithIcons?.map(({ state, count, icon: Icon }) => (
            <div key={state} className="w-full">
              <StatCard
                title={state}
                value={count}
                icon={<Icon className="h-6 w-6" />}
                change={0}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default HomeTracking;
