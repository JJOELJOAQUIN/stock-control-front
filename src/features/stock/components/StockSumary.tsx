import { Card, CardContent } from "@/shared/components/ui/card";
import { Package, PackageCheck, PackageX, AlertTriangle } from "lucide-react";


type Props = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockCount?: number;
};

const summaryItems = [
  {
    key: "total",
    label: "Total Productos",
    icon: Package,
    getValue: (p: Props) => p.totalProducts,
    gradient: "from-slate-500/10 to-slate-600/5",
    iconBg: "bg-slate-500/10",
    iconColor: "text-slate-600",
  },
  {
    key: "active",
    label: "Activos",
    icon: PackageCheck,
    getValue: (p: Props) => p.activeProducts,
    gradient: "from-emerald-500/10 to-emerald-600/5",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    key: "inactive",
    label: "Inactivos",
    icon: PackageX,
    getValue: (p: Props) => p.inactiveProducts,
    gradient: "from-rose-500/10 to-rose-600/5",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600",
  },
  {
    key: "lowStock",
    label: "Stock Bajo",
    icon: AlertTriangle,
    getValue: (p: Props) => p.lowStockCount ?? 0,
    gradient: "from-amber-500/10 to-amber-600/5",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
] as const;

export function StockSummary(props: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {summaryItems.map((item) => {
        const Icon = item.icon;
        const value = item.getValue(props);

        return (
          <Card
            key={item.key}
            className={`relative overflow-hidden border-0 bg-gradient-to-br ${item.gradient}`}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
