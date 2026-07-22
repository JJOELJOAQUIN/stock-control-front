import { useMemo, useState } from "react";
import { Sparkles, Stethoscope, TrendingUp } from "lucide-react";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { useHasRole } from "@/features/auth/hooks/useRoles";
import {
  COSMETOLOGIA_PROCEDURES,
  MEDICA_PROCEDURES,
} from "@/features/caja/types/cash.types";
import { useGetMonthlyMetricsQuery, type MonthlyMetrics } from "../api/metricsApi";

function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthlyMetricsCard() {
  const [monthValue, setMonthValue] = useState(currentMonthValue());
  const [yearStr, monthStr] = monthValue.split("-");

  // La médica ve el panel completo; la cosmetóloga, sólo lo suyo. El
  // backend ya filtra por rol: esto decide qué se dibuja, no qué se recibe.
  const isCosmetologist = useHasRole(["COSMETOLOGA"]);

  const { data } = useGetMonthlyMetricsQuery({
    context: "CONSULTORIO",
    year: Number(yearStr),
    month: Number(monthStr),
  });

  const metrics = data as MonthlyMetrics | undefined;

  const view = useMemo(() => {
    const cosmoCodes = new Set(COSMETOLOGIA_PROCEDURES.map((p) => p.code));
    const labels = new Map(
      [...MEDICA_PROCEDURES, ...COSMETOLOGIA_PROCEDURES].map((p) => [p.code, p.label])
    );

    const rows = metrics?.procedures ?? [];
    const cosmo = rows.filter((r) => cosmoCodes.has(r.procedureCode));
    const medica = rows.filter((r) => !cosmoCodes.has(r.procedureCode));

    const sum = (xs: typeof rows, f: (r: (typeof rows)[number]) => number) =>
      xs.reduce((acc, r) => acc + Number(f(r) ?? 0), 0);

    const top = [...rows].sort((a, b) => b.count - a.count)[0];

    return {
      totalCount: sum(rows, (r) => r.count),
      medicaCount: sum(medica, (r) => r.count),
      cosmoCount: sum(cosmo, (r) => r.count),
      consultas: rows.find((r) => r.procedureCode === "CONSULTA")?.count ?? 0,
      topLabel: top ? labels.get(top.procedureCode) ?? top.procedureCode : "—",
      topCount: top?.count ?? 0,
      facturado:
        sum(rows, (r) => r.amount) + Number(metrics?.products.amount ?? 0),
      paraMedica:
        sum(rows, (r) => r.doctorShare) + Number(metrics?.products.doctorShare ?? 0),
      paraCosmo:
        sum(rows, (r) => r.cosmetologistShare) +
        Number(metrics?.products.cosmetologistShare ?? 0),
      // Lo que queda para Pili de los procedimientos que hizo Gise: es el
      // reparto del uso del consultorio, no una comisión de venta.
      cosmoPagaAMedica: sum(cosmo, (r) => r.doctorShare),
      ventas: Number(metrics?.products.count ?? 0),
      ventasMonto: Number(metrics?.products.amount ?? 0),
      ventasParteCosmo: Number(metrics?.products.cosmetologistShare ?? 0),
      ranking: [...rows]
        .sort((a, b) => b.count - a.count)
        .map((r) => ({
          code: r.procedureCode,
          label: labels.get(r.procedureCode) ?? r.procedureCode,
          count: r.count,
          amount: Number(r.amount ?? 0),
          cosmoShare: Number(r.cosmetologistShare ?? 0),
          isCosmo: cosmoCodes.has(r.procedureCode),
        })),
    };
  }, [metrics]);

  const header = (
    <CardHeader>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <CardTitle>{isCosmetologist ? "Tu mes" : "Métricas del mes"}</CardTitle>
            <CardDescription>
              {isCosmetologist
                ? "Lo que hiciste y lo que te corresponde."
                : "Procedimientos, ventas y reparto entre las dos."}
            </CardDescription>
          </div>
        </div>
        <Input
          type="month"
          value={monthValue}
          onChange={(e) => setMonthValue(e.target.value)}
          className="w-full sm:w-44"
        />
      </div>
    </CardHeader>
  );

  // ───────────── Vista de la cosmetóloga ─────────────
  if (isCosmetologist) {
    return (
      <Card>
        {header}
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Kpi
              icon={<Sparkles className="size-4 text-violet-600" />}
              label="Procedimientos"
              value={String(view.totalCount)}
            />
            <Money label="Tu total del mes" value={view.paraCosmo} strong />
            <Kpi
              label="Lo que más hiciste"
              value={view.topLabel}
              hint={view.topCount ? `${view.topCount} veces` : undefined}
              small
            />
          </div>

          {view.ventasParteCosmo > 0 && (
            <p className="text-xs text-muted-foreground">
              Incluye {currencyFormatter.format(view.ventasParteCosmo)} por
              ventas de producto.
            </p>
          )}

          {view.ranking.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Detalle por procedimiento
              </p>
              {view.ranking.map((r) => (
                <div
                  key={r.code}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                    >
                      {r.count}
                    </Badge>
                    <span className="truncate">{r.label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {currencyFormatter.format(r.cosmoShare)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Sin movimientos en este mes.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // ───────────── Vista de la médica ─────────────
  return (
    <Card>
      {header}
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi
            icon={<Stethoscope className="size-4 text-sky-600" />}
            label="Procedimientos médica"
            value={String(view.medicaCount)}
            hint={`${view.consultas} consultas`}
          />
          <Kpi
            icon={<Sparkles className="size-4 text-violet-600" />}
            label="Procedimientos cosmetología"
            value={String(view.cosmoCount)}
          />
          <Kpi
            label="Ventas de producto"
            value={String(view.ventas)}
            hint={currencyFormatter.format(view.ventasMonto)}
          />
          <Kpi
            label="Más realizado"
            value={view.topLabel}
            hint={view.topCount ? `${view.topCount} veces` : undefined}
            small
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Money label="Total facturado" value={view.facturado} strong />
          <Money label="Para la médica" value={view.paraMedica} />
          <Money label="Para la cosmetóloga" value={view.paraCosmo} />
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Parte de la médica en procedimientos de cosmetología
            </span>
            <span className="font-semibold">
              {currencyFormatter.format(view.cosmoPagaAMedica)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Es el 30% del consultorio sobre lo que hizo Gise. No incluye las
            ventas de producto, donde la mercadería ya es de Pili.
          </p>
        </div>

        {view.ranking.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Detalle por procedimiento
            </p>
            {view.ranking.map((r) => (
              <div
                key={r.code}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      r.isCosmo
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                        : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                    }
                  >
                    {r.count}
                  </Badge>
                  <span className="truncate">{r.label}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {currencyFormatter.format(r.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {!view.ranking.length && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sin movimientos en este mes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Kpi({
  icon, label, value, hint, small,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className={small ? "mt-1 truncate text-sm font-semibold" : "mt-1 text-2xl font-bold"}>
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Money({
  label, value, strong,
}: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={strong ? "mt-1 text-xl font-bold" : "mt-1 text-lg font-semibold"}>
        {currencyFormatter.format(value)}
      </p>
    </div>
  );
}