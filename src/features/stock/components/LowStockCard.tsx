import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, PackageCheck, ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { ProductWithStock } from "@/features/stock/types/stock.types";
import { restockPriorityLabel } from "@/features/stock/types/stock.types";

type Props = {
  products: ProductWithStock[];
  /** Abre el flujo de compra precargado con el producto. */
  onPurchaseProduct?: (product: ProductWithStock) => void;
  /** Si arranca abierto. Por defecto colapsado. */
  defaultOpen?: boolean;
};

type LowStockRow = ProductWithStock & {
  missing: number;
  /** Cobertura del mínimo: 0 = sin stock, 1 = justo en el mínimo. */
  coverage: number;
  priority: number;
};

/**
 * Regla de urgencia (de más urgente a menos):
 * 1. Prioridad de reposición del producto (crítica > alta > normal).
 * 2. Cobertura del mínimo (0/5 es peor que 4/5, aunque falte lo mismo).
 * 3. Faltante absoluto (a igual cobertura, falta más = más urgente).
 */
function byUrgency(a: LowStockRow, b: LowStockRow): number {
  if (a.priority !== b.priority) return b.priority - a.priority;
  if (a.coverage !== b.coverage) return a.coverage - b.coverage;
  return b.missing - a.missing;
}

function priorityBadge(priority: number) {
  if (priority >= 2) {
    return <Badge variant="destructive">Crítica</Badge>;
  }
  if (priority === 1) {
    return (
      <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-500/90">
        Alta
      </Badge>
    );
  }
  return null;
}

export function LowStockCard({ products, onPurchaseProduct, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const lowStock = useMemo<LowStockRow[]>(() => {
    return products
      // La regla se computa acá y no se confía en el flag del server: un
      // producto está bajo si su stock actual está por debajo del mínimo
      // configurado (mínimo 0 nunca dispara alerta).
      .filter((p) => p.minimumStock > 0 && p.currentStock < p.minimumStock)
      .map((p) => ({
        ...p,
        missing: p.minimumStock - p.currentStock,
        coverage: p.currentStock / p.minimumStock,
        priority: p.restockPriority ?? 0,
      }))
      .sort(byUrgency);
  }, [products]);

  const criticalCount = lowStock.filter(
    (p) => p.priority >= 2 || p.currentStock === 0
  ).length;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 pb-4 text-left"
        >
          <CardTitle className="flex flex-1 flex-wrap items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Productos con stock bajo
            {lowStock.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {lowStock.length}
              </Badge>
            )}
            {criticalCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({criticalCount} {criticalCount === 1 ? "urgente" : "urgentes"})
              </span>
            )}
          </CardTitle>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </CardHeader>

      {open && (
        <CardContent>
          {lowStock.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50/60 px-4 py-6 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
              <PackageCheck className="h-5 w-5 shrink-0" />
              <span>Todos los productos están por encima del mínimo.</span>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-foreground">{p.name}</p>
                      {priorityBadge(p.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {restockPriorityLabel(p.priority) !== "Normal"
                        ? `Prioridad ${restockPriorityLabel(p.priority).toLowerCase()} · `
                        : ""}
                      Stock {p.currentStock} / mínimo {p.minimumStock}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        p.currentStock === 0
                          ? "border-destructive text-destructive"
                          : "border-amber-500/60 text-foreground"
                      }
                    >
                      {p.currentStock === 0
                        ? "Sin stock"
                        : `Faltan ${p.missing}`}
                    </Badge>

                    {onPurchaseProduct && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onPurchaseProduct(p)}
                      >
                        <ShoppingCart className="size-3.5" />
                        Comprar
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}