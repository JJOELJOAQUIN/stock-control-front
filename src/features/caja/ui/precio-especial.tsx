import { useState } from "react";
import { Tag } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ProductMultiSaleDialog } from "./components/ProductMultiSaleDialog";
import { useGetProductsWithStockQuery } from "@/features/stock/api/stockApi";

/**
 * "Precio especial" = la ex venta multi-item de Stock, mudada a Caja: varios
 * productos en una sola operacion, con descuento porcentual y motivo
 * (familiar, promo, etc.). Distinta de "Venta combinada", que mezcla
 * productos CON procedimientos y reparte entre las dos.
 */
export default function PrecioEspecialPage() {
  const [open, setOpen] = useState(false);

  const { data: products = [] } = useGetProductsWithStockQuery({
    context: "CONSULTORIO",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Precio especial</h1>
        <p className="text-sm text-muted-foreground">
          Venta de varios productos con descuento y motivo registrado.
        </p>
      </div>

      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Tag className="size-6" />
        </span>
        <span className="text-sm font-semibold">Nueva venta con precio especial</span>
      </Button>

      <ProductMultiSaleDialog
        open={open}
        onOpenChange={setOpen}
        context="CONSULTORIO"
        products={products}
        initialProduct={null}
        onSuccess={() => setOpen(false)}
      />
    </div>
  );
}