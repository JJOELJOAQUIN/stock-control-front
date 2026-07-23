import { useState } from "react";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { PurchaseDialog } from "@/features/stock/components/PurchaseDialog";
import { useCashConsultorioPage } from "../hooks/useCashConsultorioPage";

/**
 * Compras a proveedor como seccion propia. Usa el mismo flujo de siempre
 * (purchaseProductFromCash): cash OUT + stock + lote, y para productos con
 * unidad consumible configurada la cantidad se carga en ENVASES y el stock
 * ingresa multiplicado.
 */
export default function ComprasPage() {
  const [open, setOpen] = useState(false);

  const { products, purchaseProductFromCash, isPurchasingProduct } =
    useCashConsultorioPage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compras</h1>
        <p className="text-sm text-muted-foreground">
          Registra compras a proveedor: plata, stock y lote en una operacion.
        </p>
      </div>

      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ShoppingCart className="size-6" />
        </span>
        <span className="text-sm font-semibold">Registrar compra de productos</span>
      </Button>

      <PurchaseDialog
        open={open}
        onOpenChange={setOpen}
        products={products}
        isSubmitting={isPurchasingProduct}
        onSubmit={async (order) => {
          await purchaseProductFromCash(order);
          setOpen(false);
        }}
      />
    </div>
  );
}