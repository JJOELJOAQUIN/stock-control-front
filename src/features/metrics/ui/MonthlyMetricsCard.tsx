import { useMemo, useState } from "react";
import { Sparkles, Stethoscope, TrendingUp, ChevronRight, ShoppingBag } from "lucide-react";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { useHasRole } from "@/features/auth/hooks/useRoles";
import { useProcedureOptions } from "@/features/caja/hooks/useProcedureOptions";
import {
  useGetMonthlyMetricsQuery,
  type MonthlyMetrics,
  type CosmetologistProductRow,
} from "../api/metricsApi";

function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type RankRow = {
  code: string;
  label: string;
  count: number;
  amount: number;
  cosmoShare: number;
  doctorShare: number;
  isCosmo: boolean;
};

// Qué modal de procedimientos está abierto.
// 'medica'       → vista Pili, card "Procedimientos médica": lo que le entra
//                  a la médica (médicos al 100% + el 30% de las cosmetologías).
// 'cosmetologia' → vista Pili, card "Procedimientos cosmetología": SOLO las
//                  cosmetologías, con su facturado y el reparto 70/30.
// 'self'         → vista Gise: sus procedimientos con su parte.
type ProcModal = null | "medica" | "cosmetologia" | "self";

export function MonthlyMetricsCard() {
  const [monthValue, setMonthValue] = useState(currentMonthValue());
  const [yearStr, monthStr] = monthValue.split("-");

  const [procModal, setProcModal] = useState<ProcModal>(null);
  // Modales de las cards de plata: total facturado, para la médica, ventas.
  const [moneyModal, setMoneyModal] = useState<null | "facturado" | "medica" | "productos">(null);
  // Detalle de lo que vendió Gise (mismo dato en las dos vistas).
  const [cosmoProductsOpen, setCosmoProductsOpen] = useState(false);

  const isCosmetologist = useHasRole(["COSMETOLOGA"]);

  // Clasificación médica/cosmetología y etiquetas: salen del catálogo (con
  // fallback a las constantes), así un tratamiento nuevo cae en el bucket
  // correcto y se muestra con su nombre, no con el código.
  const { cosmetologia: cosmoOptions, all: allOptions } = useProcedureOptions();

  const { data } = useGetMonthlyMetricsQuery({
    context: "CONSULTORIO",
    year: Number(yearStr),
    month: Number(monthStr),
  });

  const metrics = data as MonthlyMetrics | undefined;

  const view = useMemo(() => {
    const cosmoCodes = new Set(cosmoOptions.map((p) => p.code));
    const labels = new Map(allOptions.map((p) => [p.code, p.label]));

    const rows = metrics?.procedures ?? [];
    const cosmo = rows.filter((r) => cosmoCodes.has(r.procedureCode));
    const medica = rows.filter((r) => !cosmoCodes.has(r.procedureCode));

    const sum = (xs: typeof rows, f: (r: (typeof rows)[number]) => number) =>
      xs.reduce((acc, r) => acc + Number(f(r) ?? 0), 0);

    const toRank = (xs: typeof rows): RankRow[] =>
      [...xs]
        .sort((a, b) => b.count - a.count || Number(b.amount) - Number(a.amount))
        .map((r) => ({
          code: r.procedureCode,
          label: labels.get(r.procedureCode) ?? r.procedureCode,
          count: r.count,
          amount: Number(r.amount ?? 0),
          cosmoShare: Number(r.cosmetologistShare ?? 0),
          doctorShare: Number(r.doctorShare ?? 0),
          isCosmo: cosmoCodes.has(r.procedureCode),
        }));

    const top = [...rows].sort((a, b) => b.count - a.count)[0];

    // Detalle por producto (ya viene ordenado del backend; re-ordeno defensivo).
    const productDetail = [...(metrics?.productDetail ?? [])].sort(
      (a, b) => b.count - a.count || b.revenue - a.revenue
    );
    const sumP = (f: (r: (typeof productDetail)[number]) => number) =>
      productDetail.reduce((acc, r) => acc + Number(f(r) ?? 0), 0);

    const gananciaProductos = sumP((r) => r.profit);   // revenue - costo - comisión
    const costoProductos = sumP((r) => r.cost);
    const comisionGise = sumP((r) => r.commission);
    const revenueProductos = sumP((r) => r.revenue);

    // Detalle de lo que vendió Gise (sin costo; sirve para las dos vistas).
    const cosmoProductDetail = [...(metrics?.cosmetologistProductDetail ?? [])].sort(
      (a, b) => b.count - a.count || b.revenue - a.revenue
    );
    const sumCP = (f: (r: CosmetologistProductRow) => number) =>
      cosmoProductDetail.reduce((acc, r) => acc + Number(f(r) ?? 0), 0);
    const cosmoProductUnits = sumCP((r) => r.count);
    const cosmoProductRevenue = sumCP((r) => r.revenue);
    const cosmoProductCommission = sumCP((r) => r.commission);

    const medicaProcMonto = sum(medica, (r) => r.amount);
    const cosmoProcMonto = sum(cosmo, (r) => r.amount);
    const cosmoParaMedica = sum(cosmo, (r) => r.doctorShare);
    // Lo que le queda a la médica por procedimientos (médicos 100% + 30% cosmo).
    const procParaMedica = medicaProcMonto + cosmoParaMedica;

    return {
      totalCount: sum(rows, (r) => r.count),
      medicaCount: sum(medica, (r) => r.count),
      cosmoCount: sum(cosmo, (r) => r.count),
      consultas: rows.find((r) => r.procedureCode === "CONSULTA")?.count ?? 0,
      topLabel: top ? labels.get(top.procedureCode) ?? top.procedureCode : "—",
      topCount: top?.count ?? 0,

      // Rankings ya separados por tipo, ordenados de mayor a menor.
      medicaRows: toRank(medica),
      cosmoRows: toRank(cosmo),

      // Subtotales de procedimientos.
      medicaProcMonto,
      cosmoProcMonto,
      cosmoParaMedica,
      cosmoParaCosmo: sum(cosmo, (r) => r.cosmetologistShare),
      procParaMedica,

      facturado:
        sum(rows, (r) => r.amount) + Number(metrics?.products.amount ?? 0),
      // "Para la médica" REAL: procedimientos + ganancia real de productos
      // (cobrado − costo − comisión de Gise), no el bruto de productos.
      paraMedica: procParaMedica + gananciaProductos,
      paraCosmo:
        sum(rows, (r) => r.cosmetologistShare) +
        Number(metrics?.products.cosmetologistShare ?? 0),
      cosmoPagaAMedica: sum(cosmo, (r) => r.doctorShare),

      ventas: Number(metrics?.products.count ?? 0),
      ventasMonto: Number(metrics?.products.amount ?? 0),
      ventasParteCosmo: Number(metrics?.products.cosmetologistShare ?? 0),

      // Detalle de productos + ganancia.
      productDetail,
      gananciaProductos,
      costoProductos,
      comisionGise,
      revenueProductos,

      // Detalle de productos vendidos por Gise (sin costo).
      cosmoProductDetail,
      cosmoProductUnits,
      cosmoProductRevenue,
      cosmoProductCommission,
    };
  }, [metrics, cosmoOptions, allOptions]);

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
              onClick={view.cosmoRows.length ? () => setProcModal("self") : undefined}
            />
            <Money label="Tu total del mes" value={view.paraCosmo} strong />
            <Kpi
              icon={<ShoppingBag className="size-4 text-emerald-600" />}
              label="Productos que vendiste"
              value={String(view.cosmoProductUnits)}
              hint={
                view.cosmoProductCommission > 0
                  ? `${currencyFormatter.format(view.cosmoProductCommission)} de comisión`
                  : undefined
              }
              onClick={view.cosmoProductDetail.length ? () => setCosmoProductsOpen(true) : undefined}
            />
          </div>

          {view.ventasParteCosmo > 0 && (
            <p className="text-xs text-muted-foreground">
              Incluye {currencyFormatter.format(view.ventasParteCosmo)} por
              ventas de producto.
            </p>
          )}

          {view.cosmoRows.length > 0 || view.cosmoProductDetail.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {view.cosmoRows.length > 0 && (
                <DetailTrigger
                  label="Detalle por procedimiento"
                  hint={`Ver el desglose de tus ${view.totalCount} procedimientos.`}
                  onClick={() => setProcModal("self")}
                />
              )}
              {view.cosmoProductDetail.length > 0 && (
                <DetailTrigger
                  label="Detalle de productos vendidos"
                  hint={`${view.cosmoProductUnits} unidades · ${currencyFormatter.format(
                    view.cosmoProductCommission
                  )} de comisión.`}
                  onClick={() => setCosmoProductsOpen(true)}
                />
              )}
            </div>
          ) : (
            <EmptyMonth />
          )}
        </CardContent>

        <SelfProceduresDialog
          open={procModal === "self"}
          onOpenChange={(o) => setProcModal(o ? "self" : null)}
          rows={view.cosmoRows}
          total={view.paraCosmo}
          ventasParteCosmo={view.ventasParteCosmo}
        />

        <CosmoProductsDialog
          open={cosmoProductsOpen}
          onOpenChange={setCosmoProductsOpen}
          mine
          rows={view.cosmoProductDetail}
          revenue={view.cosmoProductRevenue}
          commission={view.cosmoProductCommission}
        />
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
            onClick={view.medicaRows.length || view.cosmoRows.length
              ? () => setProcModal("medica") : undefined}
          />
          <Kpi
            icon={<Sparkles className="size-4 text-violet-600" />}
            label="Procedimientos cosmetología"
            value={String(view.cosmoCount)}
            onClick={view.cosmoRows.length ? () => setProcModal("cosmetologia") : undefined}
          />
          <Kpi
            label="Ventas de producto"
            value={String(view.ventas)}
            hint={currencyFormatter.format(view.ventasMonto)}
            onClick={view.productDetail.length ? () => setMoneyModal("productos") : undefined}
          />
          <Kpi
            label="Más realizado"
            value={view.topLabel}
            hint={view.topCount ? `${view.topCount} veces` : undefined}
            small
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Money label="Total facturado" value={view.facturado} strong
            onClick={() => setMoneyModal("facturado")} />
          <Money label="Para la médica" value={view.paraMedica}
            onClick={() => setMoneyModal("medica")} />
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

        {view.medicaRows.length || view.cosmoRows.length || view.cosmoProductDetail.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailTrigger
              label="Detalle procedimientos médicos"
              hint="Lo que le entra a la médica, por procedimiento."
              onClick={() => setProcModal("medica")}
            />
            {view.cosmoRows.length > 0 && (
              <DetailTrigger
                label="Detalle cosmetología"
                hint="Facturado y reparto 70/30 por procedimiento."
                onClick={() => setProcModal("cosmetologia")}
              />
            )}
            {view.cosmoProductDetail.length > 0 && (
              <DetailTrigger
                label="Productos vendidos por Gise"
                hint={`${view.cosmoProductUnits} unidades · comisión ${currencyFormatter.format(
                  view.cosmoProductCommission
                )}.`}
                onClick={() => setCosmoProductsOpen(true)}
              />
            )}
          </div>
        ) : (
          <EmptyMonth />
        )}
      </CardContent>

      {/* Modal médica: médicos al 100% + el 30% de cosmetologías */}
      <MedicaProceduresDialog
        open={procModal === "medica"}
        onOpenChange={(o) => setProcModal(o ? "medica" : null)}
        medicaRows={view.medicaRows}
        cosmoRows={view.cosmoRows}
        medicaTotal={view.medicaProcMonto}
        cosmoParaMedica={view.cosmoParaMedica}
      />

      {/* Modal cosmetología: solo cosmetologías, con reparto */}
      <CosmetologiaProceduresDialog
        open={procModal === "cosmetologia"}
        onOpenChange={(o) => setProcModal(o ? "cosmetologia" : null)}
        rows={view.cosmoRows}
        totalFacturado={view.cosmoProcMonto}
        paraCosmo={view.cosmoParaCosmo}
        paraMedica={view.cosmoParaMedica}
      />

      {/* Modal ventas de producto: detalle + ganancia real, más vendido primero */}
      <ProductsDialog
        open={moneyModal === "productos"}
        onOpenChange={(o) => setMoneyModal(o ? "productos" : null)}
        rows={view.productDetail}
        revenue={view.revenueProductos}
        cost={view.costoProductos}
        commission={view.comisionGise}
        profit={view.gananciaProductos}
      />

      {/* Modal productos vendidos por Gise: cantidad, cobrado y su comisión */}
      <CosmoProductsDialog
        open={cosmoProductsOpen}
        onOpenChange={setCosmoProductsOpen}
        rows={view.cosmoProductDetail}
        revenue={view.cosmoProductRevenue}
        commission={view.cosmoProductCommission}
      />

      {/* Modal total facturado: de dónde sale cada peso */}
      <FacturadoDialog
        open={moneyModal === "facturado"}
        onOpenChange={(o) => setMoneyModal(o ? "facturado" : null)}
        medicaProc={view.medicaProcMonto}
        cosmoProc={view.cosmoProcMonto}
        productos={view.ventasMonto}
        total={view.facturado}
      />

      {/* Modal para la médica: desglose con la ganancia real de productos */}
      <ParaMedicaDialog
        open={moneyModal === "medica"}
        onOpenChange={(o) => setMoneyModal(o ? "medica" : null)}
        medicaProc={view.medicaProcMonto}
        cosmoParaMedica={view.cosmoParaMedica}
        revenue={view.revenueProductos}
        cost={view.costoProductos}
        commission={view.comisionGise}
        profit={view.gananciaProductos}
        total={view.paraMedica}
      />
    </Card>
  );
}

// ═══════════════ Modales ═══════════════

// Médica: dos bloques — procedimientos médicos (100%) y el aporte del 30%
// de las cosmetologías. El total es lo que le queda a la médica por
// procedimientos.
function MedicaProceduresDialog({
  open, onOpenChange, medicaRows, cosmoRows, medicaTotal, cosmoParaMedica,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  medicaRows: RankRow[];
  cosmoRows: RankRow[];
  medicaTotal: number;
  cosmoParaMedica: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Procedimientos — médica</DialogTitle>
          <DialogDescription>
            Lo que le entra a la médica, de mayor a menor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-3">
          <Section
            title="Procedimientos médicos (100%)"
            rows={medicaRows}
            valueOf={(r) => r.amount}
            badgeClass="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
            subtotalLabel="Subtotal médicos"
            subtotal={medicaTotal}
          />
          {cosmoRows.length > 0 && (
            <Section
              title="Cosmetología — parte de la médica (30%)"
              rows={cosmoRows}
              valueOf={(r) => r.doctorShare}
              badgeClass="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
              subtotalLabel="Subtotal 30% cosmetología"
              subtotal={cosmoParaMedica}
            />
          )}
        </div>

        <TotalFooter label="Total para la médica" value={medicaTotal + cosmoParaMedica} />
      </DialogContent>
    </Dialog>
  );
}

// Cosmetología: solo cosmetologías, con facturado por procedimiento y el
// reparto total 70/30 en el pie.
function CosmetologiaProceduresDialog({
  open, onOpenChange, rows, totalFacturado, paraCosmo, paraMedica,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rows: RankRow[];
  totalFacturado: number;
  paraCosmo: number;
  paraMedica: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Procedimientos — cosmetología</DialogTitle>
          <DialogDescription>
            Facturado por procedimiento, de mayor a menor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {rows.map((r) => (
            <Row key={r.code} label={r.label} count={r.count} value={r.amount}
              badgeClass="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" />
          ))}
        </div>

        <div className="border-t px-6 py-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Para Gise (70%)</span>
            <span className="tabular-nums">{currencyFormatter.format(paraCosmo)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Para la médica (30%)</span>
            <span className="tabular-nums">{currencyFormatter.format(paraMedica)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-medium">Total facturado</span>
            <span className="text-lg font-bold tabular-nums">
              {currencyFormatter.format(totalFacturado)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Gise: sus procedimientos con su parte.
function SelfProceduresDialog({
  open, onOpenChange, rows, total, ventasParteCosmo,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rows: RankRow[];
  total: number;
  ventasParteCosmo: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Tus procedimientos</DialogTitle>
          <DialogDescription>
            Lo que te correspondió por cada uno, de mayor a menor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {rows.map((r) => (
            <Row key={r.code} label={r.label} count={r.count} value={r.cosmoShare}
              badgeClass="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" />
          ))}
        </div>

        <div className="border-t px-6 py-4 space-y-2">
          {ventasParteCosmo > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">+ Ventas de producto</span>
              <span className="tabular-nums">{currencyFormatter.format(ventasParteCosmo)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-medium">Tu total del mes</span>
            <span className="text-lg font-bold tabular-nums">
              {currencyFormatter.format(total + ventasParteCosmo)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Productos vendidos por la cosmetóloga: cantidad, cobrado y su comisión (5%).
// Sin costo ni ganancia — se usa igual en la vista de la Dra (`mine` = false,
// "por Gise") y en la de Gise (`mine` = true, "que vendiste"). Es el detalle
// para el conteo mensual que pidieron.
function CosmoProductsDialog({
  open, onOpenChange, rows, revenue, commission, mine = false,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rows: CosmetologistProductRow[];
  revenue: number;
  commission: number;
  mine?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {mine ? "Productos que vendiste" : "Productos vendidos por Gise"}
          </DialogTitle>
          <DialogDescription>
            Cada producto, del más vendido al menos, con lo cobrado y la
            comisión del 5%.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="flex items-center justify-between border-b py-2 text-xs font-medium text-muted-foreground">
            <span>Producto</span>
            <span className="flex gap-6">
              <span className="w-24 text-right">Cobrado</span>
              <span className="w-24 text-right">Comisión</span>
            </span>
          </div>
          {rows.map((r) => (
            <div key={r.productId}
              className="flex items-center justify-between gap-2 border-b py-2 text-sm last:border-b-0">
              <span className="flex min-w-0 items-center gap-2">
                <Badge variant="secondary">{r.count}</Badge>
                <span className="truncate">{r.name}</span>
              </span>
              <span className="flex shrink-0 gap-6 tabular-nums">
                <span className="w-24 text-right">{currencyFormatter.format(r.revenue)}</span>
                <span className="w-24 text-right font-medium text-violet-600 dark:text-violet-400">
                  {currencyFormatter.format(r.commission)}
                </span>
              </span>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin ventas de producto este mes.
            </p>
          )}
        </div>

        <div className="border-t px-6 py-4 space-y-1.5 text-sm">
          <BreakLine label="Total cobrado" value={revenue} />
          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-medium">
              {mine ? "Tu comisión (5%)" : "Comisión de Gise (5%)"}
            </span>
            <span className="text-lg font-bold tabular-nums text-violet-600 dark:text-violet-400">
              {currencyFormatter.format(commission)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Ventas de producto: detalle por producto (más vendido primero) con la
// ganancia real, y los totales al pie.
function ProductsDialog({
  open, onOpenChange, rows, revenue, cost, commission, profit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rows: import("../api/metricsApi").ProductDetailRow[];
  revenue: number;
  cost: number;
  commission: number;
  profit: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Ventas de producto</DialogTitle>
          <DialogDescription>
            Cada producto, del más vendido al menos. La ganancia es lo cobrado
            menos el costo y menos la comisión de Gise.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="flex items-center justify-between border-b py-2 text-xs font-medium text-muted-foreground">
            <span>Producto</span>
            <span className="flex gap-6">
              <span className="w-24 text-right">Cobrado</span>
              <span className="w-24 text-right">Ganancia</span>
            </span>
          </div>
          {rows.map((r) => (
            <div key={r.productId}
              className="flex items-center justify-between gap-2 border-b py-2 text-sm last:border-b-0">
              <span className="flex min-w-0 items-center gap-2">
                <Badge variant="secondary">{r.count}</Badge>
                <span className="truncate">{r.name}</span>
              </span>
              <span className="flex shrink-0 gap-6 tabular-nums">
                <span className="w-24 text-right">{currencyFormatter.format(r.revenue)}</span>
                <span className="w-24 text-right font-medium text-emerald-600 dark:text-emerald-400">
                  {currencyFormatter.format(r.profit)}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="border-t px-6 py-4 space-y-1.5 text-sm">
          <BreakLine label="Total cobrado" value={revenue} />
          <BreakLine label="− Costo de mercadería" value={-cost} muted />
          <BreakLine label="− Comisión de Gise (5%)" value={-commission} muted />
          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-medium">Ganancia real</span>
            <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {currencyFormatter.format(profit)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Total facturado: de dónde sale cada peso.
function FacturadoDialog({
  open, onOpenChange, medicaProc, cosmoProc, productos, total,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  medicaProc: number;
  cosmoProc: number;
  productos: number;
  total: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Total facturado</DialogTitle>
          <DialogDescription>Todo lo que entró este mes, por origen.</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 space-y-1.5 text-sm">
          <BreakLine label="Procedimientos médicos" value={medicaProc} />
          <BreakLine label="Procedimientos cosmetología" value={cosmoProc} />
          <BreakLine label="Ventas de producto" value={productos} />
          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-medium">Total facturado</span>
            <span className="text-lg font-bold tabular-nums">{currencyFormatter.format(total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Para la médica: procedimientos + ganancia real de productos.
function ParaMedicaDialog({
  open, onOpenChange, medicaProc, cosmoParaMedica, revenue, cost, commission, profit, total,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  medicaProc: number;
  cosmoParaMedica: number;
  revenue: number;
  cost: number;
  commission: number;
  profit: number;
  total: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Para la médica</DialogTitle>
          <DialogDescription>
            Procedimientos más la ganancia real de productos.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 space-y-1.5 text-sm">
          <BreakLine label="Procedimientos médicos (100%)" value={medicaProc} />
          <BreakLine label="Cosmetología (30%)" value={cosmoParaMedica} />

          <div className="rounded-md bg-muted/40 px-3 py-2 mt-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Ganancia de productos
            </p>
            <BreakLine label="Cobrado" value={revenue} small />
            <BreakLine label="− Costo" value={-cost} muted small />
            <BreakLine label="− Comisión Gise" value={-commission} muted small />
            <div className="flex items-center justify-between border-t pt-1 text-sm">
              <span>Ganancia productos</span>
              <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                {currencyFormatter.format(profit)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-medium">Total para la médica</span>
            <span className="text-lg font-bold tabular-nums">{currencyFormatter.format(total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BreakLine({
  label, value, muted, small,
}: { label: string; value: number; muted?: boolean; small?: boolean }) {
  return (
    <div className={"flex items-center justify-between " + (small ? "text-xs" : "text-sm")}>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={"tabular-nums " + (muted ? "text-muted-foreground" : "")}>
        {currencyFormatter.format(value)}
      </span>
    </div>
  );
}

// ═══════════════ Piezas reutilizables ═══════════════

function Section({
  title, rows, valueOf, badgeClass, subtotalLabel, subtotal,
}: {
  title: string;
  rows: RankRow[];
  valueOf: (r: RankRow) => number;
  badgeClass: string;
  subtotalLabel: string;
  subtotal: number;
}) {
  if (!rows.length) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
      {rows.map((r) => (
        <Row key={r.code} label={r.label} count={r.count} value={valueOf(r)} badgeClass={badgeClass} />
      ))}
      <div className="mt-1 flex items-center justify-between border-t pt-1.5 text-sm">
        <span className="text-muted-foreground">{subtotalLabel}</span>
        <span className="font-medium tabular-nums">{currencyFormatter.format(subtotal)}</span>
      </div>
    </div>
  );
}

function Row({
  label, count, value, badgeClass,
}: { label: string; count: number; value: number; badgeClass: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <Badge variant="secondary" className={badgeClass}>{count}</Badge>
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 tabular-nums font-medium">{currencyFormatter.format(value)}</span>
    </div>
  );
}

function TotalFooter({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-t px-6 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold tabular-nums">{currencyFormatter.format(value)}</span>
      </div>
    </div>
  );
}

function DetailTrigger({
  label, hint, onClick,
}: { label: string; hint: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border p-3 text-left transition hover:bg-muted/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-1 text-sm">{hint}</p>
    </button>
  );
}

function EmptyMonth() {
  return (
    <p className="py-4 text-center text-sm text-muted-foreground">
      Sin movimientos en este mes.
    </p>
  );
}

function Kpi({
  icon, label, value, hint, small, onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  small?: boolean;
  onClick?: () => void;
}) {
  const clickable = Boolean(onClick);
  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={
        "rounded-lg border p-3 " +
        (clickable
          ? "cursor-pointer transition hover:bg-muted/40 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          : "")
      }
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
        {clickable && <ChevronRight className="ml-auto size-3.5" />}
      </div>
      <p className={small ? "mt-1 truncate text-sm font-semibold" : "mt-1 text-2xl font-bold"}>
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Money({
  label, value, strong, onClick,
}: { label: string; value: number; strong?: boolean; onClick?: () => void }) {
  const clickable = Boolean(onClick);
  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={
        "rounded-lg border p-3 " +
        (clickable
          ? "cursor-pointer transition hover:bg-muted/40 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          : "")
      }
    >
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        {clickable && <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />}
      </div>
      <p className={strong ? "mt-1 text-xl font-bold" : "mt-1 text-lg font-semibold"}>
        {currencyFormatter.format(value)}
      </p>
    </div>
  );
}