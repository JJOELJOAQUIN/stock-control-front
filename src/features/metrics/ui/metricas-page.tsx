import { MonthlyMetricsCard } from "./MonthlyMetricsCard";

/**
 * El blindaje real es del backend (MetricsService filtra por rol); la card
 * ya se adapta sola: panel completo para la médica, "Tu mes" para la
 * cosmetóloga. Por eso esta página no necesita RoleGate.
 */
export default function MetricasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Métricas</h1>
        <p className="text-sm text-muted-foreground">
          Procedimientos, ventas y reparto por mes.
        </p>
      </div>

      <MonthlyMetricsCard />
    </div>
  );
}