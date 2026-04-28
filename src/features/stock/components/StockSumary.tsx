import { Package } from "lucide-react";

type Props = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
};

export function StockSummary({
  totalProducts,
  activeProducts,
  inactiveProducts,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total productos</p>
            <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Package className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Activos</p>
            <p className="text-2xl font-bold text-foreground">{activeProducts}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
            <Package className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Inactivos</p>
            <p className="text-2xl font-bold text-foreground">{inactiveProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );
}