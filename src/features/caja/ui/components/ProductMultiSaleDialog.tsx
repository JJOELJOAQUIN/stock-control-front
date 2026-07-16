import { useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Badge } from "@/shared/components/ui/badge";

import { ProductSearch } from "@/features/caja/ui/components/ProductSearch";
import { currencyFormatter } from "@/shared/lib/purchase";


import type { CashActor } from "@/features/caja/types/cash.types";
import type {
  CombinedSaleItemRequest,
  CombinedSaleRequest,
} from "@/features/caja/types/combined-sale.types";
import { useCombinedSaleMutation } from "@/features/stock/api/stockApi";
import type { BusinessContext, PaymentMethod, ProductWithStock } from "@/features/stock/types/stock.types";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

const DISCOUNT_REASONS = [
  { value: "FAMILIAR", label: "Familiar" },
  { value: "AMIGO", label: "Amigo/a" },
  { value: "CORTESIA", label: "Cortesía" },
  { value: "PROMOCION", label: "Promoción" },
  { value: "OTRO", label: "Otro" },
] as const;

type DiscountReason = (typeof DISCOUNT_REASONS)[number]["value"];

type SaleLine = {
  uid: string;
  productId: string;
  name: string;
  currentStock: number;
  costPrice: number | null;
  quantity: number;
  unitAmount: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: BusinessContext;
  products: ProductWithStock[];
  /** Producto precargado al abrir (desde operaciones rápidas / catálogo). */
  initialProduct?: ProductWithStock | null;
  onSuccess?: () => void;
};

let uidSeq = 0;
const nextUid = () => `sale-line-${uidSeq++}`;

const round2 = (n: number) => Math.round(n * 100) / 100;

const buildLine = (product: ProductWithStock): SaleLine => ({
  uid: nextUid(),
  productId: product.id,
  name: product.name,
  currentStock: product.currentStock,
  costPrice: product.costPrice ?? null,
  quantity: 1,
  unitAmount: product.salePrice ?? 0,
});

/**
 * Venta multi-ítem de productos desde la pantalla de Stock, con descuento
 * especial opcional (familiar/amigo/cortesía/promoción). Reutiliza el
 * endpoint de venta combinada del backend, por lo que la operación es
 * atómica: descuenta stock de todos los ítems y genera un único movimiento
 * de caja con el detalle por ítem.
 */
export function ProductMultiSaleDialog({
  open,
  onOpenChange,
  context,
  products,
  initialProduct,
  onSuccess,
}: Props) {
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [performedBy, setPerformedBy] = useState<CashActor>("MEDICA");
  const [comment, setComment] = useState("");

  const [discountPercent, setDiscountPercent] = useState("");
  const [discountReason, setDiscountReason] = useState<DiscountReason>("FAMILIAR");

  const [combinedSale, { isLoading: isSubmitting }] = useCombinedSaleMutation();

  // Reset + precarga solo en la transición cerrado -> abierto.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setLines(initialProduct ? [buildLine(initialProduct)] : []);
      setPaymentMethod("CASH");
      setPerformedBy("MEDICA");
      setComment("");
      setDiscountPercent("");
      setDiscountReason("FAMILIAR");
    }
    wasOpen.current = open;
  }, [open, initialProduct]);

  const addedProductIds = useMemo(
    () => new Set(lines.map((l) => l.productId)),
    [lines]
  );

  const discount = useMemo(() => {
    const d = Number(discountPercent);
    if (!Number.isFinite(d) || d <= 0) return 0;
    return Math.min(d, 100);
  }, [discountPercent]);

  const effectiveUnit = (line: SaleLine) =>
    discount > 0 ? round2(line.unitAmount * (1 - discount / 100)) : line.unitAmount;

  const lineSubtotal = (line: SaleLine) => round2(line.quantity * effectiveUnit(line));

  const originalTotal = useMemo(
    () => round2(lines.reduce((acc, l) => acc + round2(l.quantity * l.unitAmount), 0)),
    [lines]
  );

  const total = useMemo(
    () => round2(lines.reduce((acc, l) => acc + lineSubtotal(l), 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, discount]
  );

  const savedAmount = round2(originalTotal - total);

  const addProduct = (product: ProductWithStock) => {
    setLines((prev) =>
      prev.some((l) => l.productId === product.id) ? prev : [...prev, buildLine(product)]
    );
  };

  const updateLine = (uid: string, patch: Partial<Pick<SaleLine, "quantity" | "unitAmount">>) => {
    setLines((prev) => prev.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));
  };

  const removeLine = (uid: string) => {
    setLines((prev) => prev.filter((l) => l.uid !== uid));
  };

  const validate = (): string | null => {
    if (lines.length === 0) return "Agregá al menos un producto a la venta";

    for (const line of lines) {
      if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
        return `${line.name}: la cantidad debe ser un entero mayor a cero`;
      }
      if (line.quantity > line.currentStock) {
        return `${line.name}: stock insuficiente (hay ${line.currentStock})`;
      }
      if (!Number.isFinite(line.unitAmount) || line.unitAmount <= 0) {
        return `${line.name}: el precio unitario debe ser mayor a cero`;
      }
      // Misma regla que el backend: no se puede vender por debajo del costo.
      if (line.costPrice != null) {
        const minExpected = round2(line.costPrice * line.quantity);
        if (lineSubtotal(line) < minExpected) {
          return `${line.name}: con el descuento queda por debajo del costo (${currencyFormatter.format(line.costPrice)} c/u). Bajá el descuento o ajustá el precio.`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const reasonLabel =
      DISCOUNT_REASONS.find((r) => r.value === discountReason)?.label ?? discountReason;

    // Trazabilidad del descuento: queda registrado en el comentario del
    // movimiento de caja, junto al detalle por ítem con el precio efectivo.
    const finalComment =
      discount > 0
        ? [`Descuento ${discount}% (${reasonLabel})`, comment.trim()]
            .filter(Boolean)
            .join(" · ")
        : comment.trim();

    const items: CombinedSaleItemRequest[] = lines.map((line) => ({
      kind: "PRODUCT",
      productId: line.productId,
      procedureCode: null,
      description: line.name,
      quantity: line.quantity,
      unitAmount: effectiveUnit(line),
      subtotal: lineSubtotal(line),
      performedBy,
      doctorSharePercent: null,
      cosmetologistSharePercent: null,
    }));

    const body: CombinedSaleRequest = {
      context,
      paymentMethod,
      comment: finalComment || null,
      performedBy,
      expectedTotal: total,
      items,
    };

    try {
      await combinedSale(body).unwrap();
      toast.success("Venta registrada correctamente");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "No se pudo registrar la venta");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] flex-col sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            Venta de productos
          </DialogTitle>
          <DialogDescription>
            Agregá uno o más productos, ajustá cantidades y precios, y aplicá
            un descuento especial si corresponde.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
          <ProductSearch
            products={products.filter((p) => p.active && p.currentStock > 0)}
            addedProductIds={addedProductIds}
            onAdd={addProduct}
          />

          {lines.length === 0 ? (
            <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              Todavía no agregaste productos. Buscá uno arriba para empezar.
            </p>
          ) : (
            <ul className="space-y-2">
              {lines.map((line) => {
                const hasDiscount = discount > 0;
                return (
                  <li key={line.uid} className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-medium">{line.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Stock disponible: {line.currentStock}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.uid)}
                        className="rounded text-destructive transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                        aria-label={`Quitar ${line.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field>
                        <FieldLabel className="text-xs">Cantidad</FieldLabel>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          step={1}
                          value={line.quantity === 0 ? "" : String(line.quantity)}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            updateLine(line.uid, {
                              quantity: Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0,
                            });
                          }}
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs">Precio unitario</FieldLabel>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.01"
                          value={String(line.unitAmount)}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            updateLine(line.uid, {
                              unitAmount: Number.isFinite(n) ? Math.max(0, n) : 0,
                            });
                          }}
                        />
                      </Field>
                    </div>

                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-xs text-muted-foreground">Subtotal</span>
                      <span className="text-sm font-medium">
                        {hasDiscount && (
                          <span className="mr-2 text-xs text-muted-foreground line-through">
                            {currencyFormatter.format(round2(line.quantity * line.unitAmount))}
                          </span>
                        )}
                        {currencyFormatter.format(lineSubtotal(line))}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* -------- Descuento especial -------- */}
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Descuento especial (opcional)</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel className="text-xs">Porcentaje de descuento</FieldLabel>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step="1"
                  placeholder="0"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs">Motivo</FieldLabel>
                <Select
                  value={discountReason}
                  onValueChange={(v) => setDiscountReason(v as DiscountReason)}
                  disabled={discount <= 0}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {discount > 0 && savedAmount > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Ahorro aplicado: {currencyFormatter.format(savedAmount)} ({discount}%)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
              <FieldLabel>Realizada por</FieldLabel>
              <Select
                value={performedBy}
                onValueChange={(v) => setPerformedBy(v as CashActor)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICA">Médica</SelectItem>
                  <SelectItem value="COSMETOLOGA">Cosmetóloga</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Comentario</FieldLabel>
              <Input
                placeholder="Opcional"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {lines.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              Total a cobrar
              {lines.length > 1 && ` (${lines.length} ítems)`}
            </span>
            <span className="flex items-center gap-2">
              {discount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  -{discount}%
                </Badge>
              )}
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {currencyFormatter.format(total)}
              </span>
            </span>
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || lines.length === 0}>
            {isSubmitting && <Spinner />}
            Registrar venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}