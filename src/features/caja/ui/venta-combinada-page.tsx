import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { CombinedSaleDialog } from "./components/CombinedSaleDialog";
import { useGetProductsWithStockQuery } from "@/features/stock/api/stockApi";
import {
  COSMETOLOGIA_PROCEDURES,
  MEDICA_PROCEDURES,
} from "../types/cash.types";

/**
 * Venta combinada como seccion propia: productos + procedimientos en un
 * solo movimiento de caja, con reparto por item.
 *
 * El reparto de cada procedimiento ya NO se pasa desde acá: lo deriva el
 * diálogo a partir del catálogo (cosmetología 70/30, médicos 100/0). Antes se
 * pasaba un default 60/40 fijo que se aplicaba a todo, y eso le metía 40% de
 * cada CONSULTA a la cosmetóloga.
 */
export default function VentaCombinadaPage() {
  const [open, setOpen] = useState(false);

  const { data: products = [] } = useGetProductsWithStockQuery({
    context: "CONSULTORIO",
  });

  const allProcedures = useMemo(
    () =>
      Array.from(
        new Map(
          [...MEDICA_PROCEDURES, ...COSMETOLOGIA_PROCEDURES].map((p) => [p.code, p])
        ).values()
      ),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Venta combinada</h1>
        <p className="text-sm text-muted-foreground">
          Productos y procedimientos juntos, con reparto por item.
        </p>
      </div>

      <Button
        onClick={() => setOpen(true)}
        className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        variant="outline"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ShoppingBag className="size-6" />
        </span>
        <span className="text-sm font-semibold">Nueva venta combinada</span>
      </Button>

      <CombinedSaleDialog
        open={open}
        onOpenChange={setOpen}
        context="CONSULTORIO"
        products={products}
        procedures={allProcedures}
      />
    </div>
  );
}