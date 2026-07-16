import { useEffect, useRef, useState } from "react";
import { MinusCircle } from "lucide-react";
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
import { INTERNAL_CONSUMPTION_REASONS, type InternalConsumptionReason, type InternalConsumptionRequest, type ProductWithStock } from "@/features/stock/types/stock.types";



type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithStock | null;
  isSubmitting: boolean;
  onSubmit: (
    payload: Omit<InternalConsumptionRequest, "context">
  ) => Promise<void> | void;
};

/**
 * Consumo interno: descuenta stock SIN registrar venta ni tocar caja.
 * Casos: 1 Labial Vitamina E para uso personal, traslado de Urban Lait
 * Prodermic SPF 35 al carrito/camilla, pedido Luca, muestras, regalos.
 */
export function InternalConsumptionDialog({
  open,
  onOpenChange,
  product,
  isSubmitting,
  onSubmit,
}: Props) {
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<InternalConsumptionReason>("USO_PERSONAL");
  const [comment, setComment] = useState("");

  // Reset del formulario solo en la transición cerrado -> abierto.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setQuantity("1");
      setReason("USO_PERSONAL");
      setComment("");
    }
    wasOpen.current = open;
  }, [open]);

  const handleSubmit = async () => {
    if (!product) {
      toast.error("No hay producto seleccionado");
      return;
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      toast.error("La cantidad debe ser un entero mayor a cero");
      return;
    }

    if (qty > product.currentStock) {
      toast.error(
        `Stock insuficiente: hay ${product.currentStock} y querés consumir ${qty}`
      );
      return;
    }

    await onSubmit({
      productId: product.id,
      quantity: qty,
      reason,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MinusCircle className="size-5 text-primary" />
            Consumo interno
          </DialogTitle>
          <DialogDescription>
            Descuenta stock sin registrar venta: uso personal, carrito/camilla,
            muestras, regalos o pedidos sin cobro. No impacta la caja ni las
            métricas de ventas.
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.brand}</p>
            </div>
            <Badge variant={product.currentStock === 0 ? "destructive" : "secondary"}>
              Stock: {product.currentStock}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Cantidad</FieldLabel>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Motivo</FieldLabel>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as InternalConsumptionReason)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERNAL_CONSUMPTION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel>Detalle (quién lo retiró / destino)</FieldLabel>
            <Input
              placeholder="Ej: Pedido Luca, carrito camilla 1, uso de Pili..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={250}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !product}>
            {isSubmitting && <Spinner />}
            Registrar consumo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}