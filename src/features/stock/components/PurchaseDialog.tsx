import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";

import type {
  PaymentMethod,
  ProductWithStock,
  PurchaseOrderRequest,
} from "@/features/stock/types/stock.types";
import { currencyFormatter, validatePurchaseOrder } from "@/shared/lib/purchase";
import { buildCartLine, usePurchaseCart } from "@/features/caja/hooks/usePurchaseChart";
import { ProductSearch } from "@/features/caja/ui/components/ProductSearch";
import { CartLineItem } from "@/features/caja/ui/components/CartLineItem";
import { Checkbox } from "@/shared/components/ui/checkbox";


type PurchaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductWithStock[];
  initialProduct?: ProductWithStock | null;
  isSubmitting: boolean;
  onSubmit: (order: Omit<PurchaseOrderRequest, "context">) => Promise<void> | void;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CASH", label: "Efectivo" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

export function PurchaseDialog({
  open,
  onOpenChange,
  products,
  initialProduct,
  isSubmitting,
  onSubmit,
}: PurchaseDialogProps) {
  const { lines, addProduct, updateLine, removeLine, reset, total, addedProductIds } =
    usePurchaseCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [comment, setComment] = useState("");
  const [updateCostForAll, setUpdateCostForAll] = useState(true);

  const itemCount = lines.length;
  const hasItems = itemCount > 0;

  // Precarga del producto inicial: solo en la transición cerrado -> abierto.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      reset(initialProduct ? [buildCartLine(initialProduct)] : []);
    }
    wasOpen.current = open;
  }, [open, initialProduct, reset]);

  const resetForm = () => {
    reset();
    setPaymentMethod("TRANSFER");
    setComment("");
    setUpdateCostForAll(true);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const error = validatePurchaseOrder(lines);

    if (error) {
      toast.error(error);
      return;
    }

    await onSubmit({
      paymentMethod,
      comment: comment.trim() || undefined,
      expectedTotal: total,
      items: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitCost: l.unitCost,
        lotNumber: l.lotNumber.trim() || null,
        expirationDate: l.expirationDate || null,
        updateCostPrice: updateCostForAll,
        updateSalePrice: false,
        newSalePrice: null,
        updateMarkupPercentage: false,
        newDefaultMarkupPercentage: null,
      })),
    });

    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            Nueva compra
          </DialogTitle>
          <DialogDescription>
            Buscá productos, agregalos al detalle y registrá la compra completa.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
          <ProductSearch
            products={products}
            addedProductIds={addedProductIds}
            onAdd={addProduct}
          />

          {!hasItems ? (
            <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              Todavía no agregaste productos. Buscá uno arriba para empezar.
            </p>
          ) : (
            <section className="space-y-2" aria-label="Detalle de la compra">
              <p className="text-sm font-medium text-muted-foreground">
                Detalle de la compra ({itemCount} {itemCount === 1 ? "ítem" : "ítems"})
              </p>
              <ul className="space-y-2">
                {lines.map((line) => (
                  <CartLineItem
                    key={line.lineId}
                    line={line}
                    onChange={updateLine}
                    onRemove={removeLine}
                  />
                ))}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field>
              <FieldLabel>Método de pago</FieldLabel>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Proveedor / comentario</FieldLabel>
              <Input
                placeholder="Opcional"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Field>
          </div>

          <label
            htmlFor="update-cost-all"
            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"
          >
            <Checkbox
              id="update-cost-all"
              checked={updateCostForAll}
              onCheckedChange={(checked) => setUpdateCostForAll(checked === true)}
            />
            Actualizar el costo de todos los productos con esta compra
          </label>
        </div>

        {hasItems && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              Total de la compra
            </span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {currencyFormatter.format(total)}
            </span>
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !hasItems}>
            {isSubmitting && <Spinner />}
            Registrar compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}