import { useMemo, useState } from "react";
import { Droplets, Search } from "lucide-react";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { InternalConsumptionDialog } from "@/features/caja/ui/components/InternalConsumptionDialog";
import { useStockPage } from "@/features/stock/hooks/useStockPage";
import type { ProductWithStock } from "@/features/stock/types/stock.types";
import type { InternalConsumptionRequest } from "@/features/stock/types/stock.types";

/**
 * Consumos internos como seccion propia: buscar el producto por nombre y
 * descontarlo sin tocar caja (uso personal, camilla, muestras, regalos).
 * Reutiliza useStockPage: el estado global ya vive en el cache de RTK.
 */
export default function StockConsumosPage() {
  const { products, handleConsume, isConsuming } = useStockPage();

  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<ProductWithStock | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p: ProductWithStock) =>
      p.name.toLowerCase().includes(q)
    );
  }, [products, search]);

  const onSubmit = async (
    payload: Omit<InternalConsumptionRequest, "context">
  ) => {
    try {
      await handleConsume(payload);
      setTarget(null);
    } catch {
      // El toast de error ya lo muestra el hook.
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Consumos</h1>
        <p className="text-sm text-muted-foreground">
          Descuenta stock sin registrar venta: uso personal, camilla, muestras.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Droplets className="size-5" />
            </div>
            <div>
              <CardTitle>Buscar producto</CardTitle>
              <CardDescription>
                Elegi el producto y registra el consumo con su motivo.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre del producto..."
              className="pl-9"
            />
          </div>

          <div className="max-h-[26rem] space-y-1 overflow-y-auto">
            {filtered.map((p: ProductWithStock) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTarget(p)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted/50"
              >
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <Badge variant={p.belowMinimum ? "destructive" : "secondary"}>
                  {p.currentStock}
                </Badge>
              </button>
            ))}

            {!filtered.length && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin resultados para esa busqueda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <InternalConsumptionDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        product={target}
        isSubmitting={isConsuming}
        onSubmit={onSubmit}
      />
    </div>
  );
}