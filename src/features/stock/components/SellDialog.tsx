import { useEffect } from "react";
import {
  Barcode,
  CreditCard,
  DollarSign,
  Banknote,
  Building2,
  Package,
  Percent,
} from "lucide-react";

import type { PaymentMethod } from "../types/stock.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
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
import { useHasRole } from "@/features/auth/hooks/useRoles";
import { usePerformer } from "@/features/caja/hooks/usePerformer";
import type { CashActor } from "@/features/caja/types/cash.types";


const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "CASH", label: "Efectivo", icon: <Banknote className="h-4 w-4" /> },
  {
    value: "TRANSFER",
    label: "Transferencia",
    icon: <Building2 className="h-4 w-4" />,
  },
  { value: "DEBIT", label: "Débito", icon: <CreditCard className="h-4 w-4" /> },
  { value: "CREDIT", label: "Crédito", icon: <CreditCard className="h-4 w-4" /> },
];

type SellForm = {
  quantity: string;
  amount: string;
  paymentMethod: PaymentMethod;
  comment: string;
  /**
   * Quien realizo la venta. Define el reparto: MEDICA se lleva el 100% del
   * neto, COSMETOLOGA el 5% y la medica el 95%. Antes no existia y el hook
   * mandaba "MEDICA" fijo, asi que toda venta escaneada por Gise se
   * registraba como propia de Pili.
   */
  performedBy: CashActor;
};

type SellDialogProduct = {
  name: string;
  barcode?: string | null;
  scope?: string;
  currentStock?: number;
  belowMinimum?: boolean;
  costPrice?: number | null;
  salePrice?: number | null;
  defaultMarkupPercentage?: number | null;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barcode: string;
  form: SellForm;
  setForm: React.Dispatch<React.SetStateAction<SellForm>>;
  isSubmitting: boolean;
  onSubmit: () => void;
  product?: SellDialogProduct | null;
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export function SellDialog({
  open,
  onOpenChange,
  barcode,
  form,
  setForm,
  isSubmitting,
  onSubmit,
  product,
}: Props) {
  // Quien vende sale del usuario logueado; la cosmetologa no puede
  // cambiarlo, la medica si (a veces carga ventas que hizo Gise).
  const performer = usePerformer();

  const quantity = Number(form.quantity) || 0;
  const amount = Number(form.amount) || 0;

  const unitSalePrice = Number(product?.salePrice ?? 0);
  const unitCostPrice = Number(product?.costPrice ?? 0);

  // COSMETOLOGA no ve costo ni ganancia estimada.
  const canViewCost = useHasRole(["ADMIN", "USER"]);

  const suggestedAmount =
    quantity > 0 && unitSalePrice > 0 ? quantity * unitSalePrice : 0;

  const estimatedProfit =
    amount > 0 && unitCostPrice > 0 && quantity > 0
      ? amount - unitCostPrice * quantity
      : 0;

  useEffect(() => {
    if (!open || !product) return;

    const qty = Number(form.quantity) || 0;
    const salePrice = Number(product.salePrice ?? 0);

    if (qty > 0 && salePrice > 0) {
      setForm((prev) => ({
        ...prev,
        amount: (qty * salePrice).toFixed(2),
      }));
    }
  }, [open, product, form.quantity, setForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Registrar Venta
          </DialogTitle>
          <DialogDescription>
            Venta de producto por código de barras
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-2">
          <FieldGroup className="space-y-5 py-4">
            <Field>
              <FieldLabel>Código de barras</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Barcode className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput value={barcode} disabled />
              </InputGroup>
            </Field>

            {product && (
              <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                      <Package className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(product.barcode ?? barcode) || "-"}
                        {product.scope ? ` · ${product.scope}` : ""}
                      </p>
                    </div>
                  </div>

                  {typeof product.currentStock === "number" && (
                    <Badge
                      variant={
                        product.belowMinimum ? "destructive" : "secondary"
                      }
                    >
                      Stock: {product.currentStock}
                    </Badge>
                  )}
                </div>

                <div className={`grid grid-cols-1 gap-3 text-sm ${canViewCost ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                  {canViewCost && (
                    <div className="rounded-lg border bg-background p-3">
                      <p className="text-muted-foreground">Costo</p>
                      <p className="font-semibold">
                        {product.costPrice != null
                          ? currencyFormatter.format(product.costPrice)
                          : "-"}
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-muted-foreground">Precio público</p>
                    <p className="font-semibold">
                      {product.salePrice != null
                        ? currencyFormatter.format(product.salePrice)
                        : "-"}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-background p-3">
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <Percent className="h-3 w-3" />
                      Margen sugerido
                    </p>
                    <p className="font-semibold">
                      {product.defaultMarkupPercentage != null
                        ? `${product.defaultMarkupPercentage}%`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Cantidad</FieldLabel>
                <Input
                  type="number"
                  min="1"
              
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Monto final editable</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <DollarSign className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                  />
                </InputGroup>
              </Field>
            </div>

            {product && (
              <div className={`grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-3 text-sm ${canViewCost ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
                <div>
                  <p className="text-muted-foreground">
                    Monto sugerido por precio público
                  </p>
                  <p className="font-semibold">
                    {suggestedAmount > 0
                      ? currencyFormatter.format(suggestedAmount)
                      : "-"}
                  </p>
                </div>

                {canViewCost && (
                  <div>
                    <p className="text-muted-foreground">Ganancia estimada</p>
                    <p className="font-semibold">
                      {estimatedProfit > 0
                        ? currencyFormatter.format(estimatedProfit)
                        : "-"}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Field>
              <FieldLabel>Método de pago</FieldLabel>
              <Select
                value={form.paymentMethod}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    paymentMethod: value as PaymentMethod,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <span className="flex items-center gap-2">
                        {method.icon}
                        {method.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Venta realizada por</FieldLabel>
              {performer.locked ? (
                <div className="flex h-9 w-full items-center gap-2 rounded-md border bg-muted/40 px-3">
                  <Badge variant="secondary">{performer.label}</Badge>
                  <span className="text-xs text-muted-foreground">
                    detectado por tu usuario
                  </span>
                </div>
              ) : (
                <Select
                  value={form.performedBy}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      performedBy: value as CashActor,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="MEDICA">Médica</SelectItem>
                    <SelectItem value="COSMETOLOGA">Cosmetóloga</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field>
              <FieldLabel>Comentario (opcional)</FieldLabel>
              <Input
                placeholder="Notas sobre la venta..."
                value={form.comment}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
              />
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Procesando...
              </>
            ) : (
              "Confirmar Venta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}