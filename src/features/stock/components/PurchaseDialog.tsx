import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
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
import {
  calcLineSubtotal,
  calcOrderTotal,
  currencyFormatter,
  validatePurchaseOrder,
  type PurchaseCartLine,
} from "@/shared/lib/purchase";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: ProductWithStock[];
  initialProduct?: ProductWithStock | null;
  isSubmitting: boolean;
  onSubmit: (
    order: Omit<PurchaseOrderRequest, "context">
  ) => Promise<void> | void;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CASH", label: "Efectivo" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

let lineCounter = 0;
function nextLineId() {
  lineCounter += 1;
  return `line-${lineCounter}`;
}

export function PurchaseDialog({
  open,
  onOpenChange,
  products,
  initialProduct,
  isSubmitting,
  onSubmit,
}: Props) {
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<PurchaseCartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [comment, setComment] = useState("");
  const [updateCostForAll, setUpdateCostForAll] = useState(true);

  const total = calcOrderTotal(lines);

  // Productos que matchean la búsqueda y todavía no están en el carrito.
  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];

    const alreadyAdded = new Set(lines.map((l) => l.productId));

    return products
      .filter((p) => !alreadyAdded.has(p.id))
      .filter((p) => {
        const haystack = `${p.name} ${p.barcode ?? ""}`.toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 8);
  }, [search, products, lines]);

  const buildLine = (product: ProductWithStock): PurchaseCartLine => {
    const savedCost =
      product.costPrice != null && product.costPrice > 0
        ? product.costPrice
        : 0;

    return {
      lineId: nextLineId(),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitCost: savedCost,
      lotNumber: "",
      expirationDate: "",
      updateCostPrice: updateCostForAll,
      updateSalePrice: false,
      newSalePrice: "",
    };
  };

  // Pre-carga del producto inicial: se dispara SOLO en la transición de
  // cerrado -> abierto, para no pisar lo que el usuario edite después.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setLines(initialProduct ? [buildLine(initialProduct)] : []);
    }
    wasOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialProduct]);

  const addProduct = (product: ProductWithStock) => {
    setLines((prev) => [...prev, buildLine(product)]);
    setSearch("");
  };

  const updateLine = (
    lineId: string,
    patch: Partial<Pick<PurchaseCartLine, "quantity" | "unitCost" | "lotNumber" | "expirationDate">>
  ) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, ...patch } : l))
    );
  };

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const resetState = () => {
    setSearch("");
    setLines([]);
    setPaymentMethod("TRANSFER");
    setComment("");
    setUpdateCostForAll(true);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetState();
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

    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            Nueva compra
          </DialogTitle>
          <DialogDescription>
            Buscá productos, agregalos al detalle y registrá la compra completa
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
          {/* Buscador */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar producto por nombre o código"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div className="mt-1 overflow-hidden rounded-md border">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="flex w-full items-center justify-between border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Stock: {product.currentStock} · Costo guardado:{" "}
                        {product.costPrice != null
                          ? currencyFormatter.format(product.costPrice)
                          : "—"}
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-primary">
                      <Plus className="size-3" />
                      Agregar
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalle del carrito */}
          {lines.length === 0 ? (
            <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              Todavía no agregaste productos. Buscá uno arriba para empezar.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Detalle de la compra ({lines.length}{" "}
                {lines.length === 1 ? "ítem" : "ítems"})
              </p>

              {lines.map((line) => (
                <div
                  key={line.lineId}
                  className="space-y-3 rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">
                      {line.productName}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(line.lineId)}
                      className="text-destructive hover:opacity-70"
                      aria-label="Quitar producto"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel className="text-xs">Cantidad</FieldLabel>
                      <Input
                        type="number"
                        min="1"
                        value={String(line.quantity)}
                        onChange={(e) =>
                          updateLine(line.lineId, {
                            quantity: Number(e.target.value),
                          })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel className="text-xs">Costo unitario</FieldLabel>
                      <Input
                        type="number"
                   
            
                        value={String(line.unitCost)}
                        onChange={(e) =>
                          updateLine(line.lineId, {
                            unitCost: Number(e.target.value),
                          })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel className="text-xs">Lote</FieldLabel>
                      <Input
                        placeholder="Opcional"
                        value={line.lotNumber}
                        onChange={(e) =>
                          updateLine(line.lineId, { lotNumber: e.target.value })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel className="text-xs">Vencimiento</FieldLabel>
                      <Input
                        type="date"
                        value={line.expirationDate}
                        onChange={(e) =>
                          updateLine(line.lineId, {
                            expirationDate: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-xs text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="text-sm font-medium">
                      {currencyFormatter.format(calcLineSubtotal(line))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cabecera: método de pago + comentario */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field>
              <FieldLabel>Método de pago</FieldLabel>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
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

          {/* Toggle único de actualización de costo */}
          <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              checked={updateCostForAll}
              onChange={(e) => setUpdateCostForAll(e.target.checked)}
            />
            Actualizar el costo de todos los productos con esta compra
          </label>
        </div>

        {/* Total */}
        {lines.length > 0 && (
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
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || lines.length === 0}
          >
            {isSubmitting && <Spinner />}
            Registrar compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}