import { PurchasesCard } from "@/features/stock/components/PurchaseCard";
import { MonthlyMetricsCard } from "./MonthlyMetricsCard";


/**
 * El blindaje real es del backend (MetricsService / PurchasesService filtran
 * por rol); las cards ya se adaptan solas: panel completo para la médica,
 * "Tu mes" para la cosmetóloga, y compras solo para la médica. Por eso esta
 * página no necesita RoleGate.
 */
export default function MetricasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Métricas</h1>
        <p className="text-sm text-muted-foreground">
          Procedimientos, ventas, ganancia y compras por mes.
        </p>
      </div>

      <MonthlyMetricsCard />
      <PurchasesCard />
    </div>
  );
}