import { Card, CardContent } from "@/shared/components/ui/card";
import { Package, Tag, ShoppingBag, Stethoscope } from "lucide-react";

type Props = {
  stockAtCost: number;
  stockAtSale: number;
  productSales: number;
  procedureIncome: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(value);

export function BusinessTotals({
  stockAtCost,
  stockAtSale,
  productSales,
  procedureIncome,
}: Props) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50 to-background dark:from-amber-950/20">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <Package className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">
              Stock (a costo)
            </span>
            <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatCurrency(stockAtCost)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-sky-200/50 bg-gradient-to-br from-sky-50 to-background dark:from-sky-950/20">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
            <Tag className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">
              Stock (a venta)
            </span>
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
              {formatCurrency(stockAtSale)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950/20">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <ShoppingBag className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">
              Ventas de productos
            </span>
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(productSales)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-violet-200/50 bg-gradient-to-br from-violet-50 to-background dark:from-violet-950/20">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
            <Stethoscope className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">
              Procedimientos
            </span>
            <span className="text-2xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
              {formatCurrency(procedureIncome)}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}