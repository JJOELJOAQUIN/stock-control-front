import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { ProductBatchExpiration } from "../../../stock/types/stock.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type Props = {
  items: ProductBatchExpiration[];
  isLoading?: boolean;
  /** Si arranca abierto. Por defecto colapsado. */
  defaultOpen?: boolean;
};

export function ProductExpirationAlerts({ items, isLoading, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos próximos a vencer</CardTitle>
          <CardDescription>Cargando alertas...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className="border-emerald-200/60">
        <CardHeader>
          <CardTitle>Vencimientos</CardTitle>
          <CardDescription>
            No hay productos próximos a vencer en los próximos 90 días.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-amber-300/70 bg-amber-50/40 dark:border-amber-800/70 dark:bg-amber-950/20">
      <CardHeader className="pb-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 pb-4 text-left"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
            <AlertTriangle className="size-5" />
          </div>

          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Productos próximos a vencer
              <Badge variant="secondary" className="ml-1">
                {items.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Productos con vencimiento dentro de los próximos 90 días.
            </CardDescription>
          </div>

          <ChevronDown
            className={`size-5 shrink-0 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div
              key={item.batchId}
              className="flex flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  Barcode: {item.barcode || "-"} · Lote: {item.lotNumber || "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cantidad: {item.quantityCurrent} · Vence:{" "}
                  {new Date(item.expirationDate).toLocaleDateString()}
                </p>
              </div>

              <Badge variant={item.daysToExpire <= 30 ? "destructive" : "secondary"}>
                Faltan {item.daysToExpire} días
              </Badge>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}