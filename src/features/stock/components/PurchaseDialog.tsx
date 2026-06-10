import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Spinner } from "@/shared/components/ui/spinner";
import { DollarSign, Package, ShoppingCart } from "lucide-react";

type PurchaseForm = {
  quantity: string;
  amount: string;
  comment: string;
  updateCostPrice: boolean;
  updateSalePrice: boolean;
  newSalePrice: string;
  updateMarkupPercentage: boolean;
  newDefaultMarkupPercentage: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  costPrice?: number | null;
  salePrice?: number | null;
  defaultMarkupPercentage?: number | null;
  form: PurchaseForm;
  setForm: React.Dispatch<React.SetStateAction<PurchaseForm>>;
  isSubmitting: boolean;
  onSubmit: () => void;
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export function PurchaseDialog({
  open,
  onOpenChange,
  productName,
  costPrice,
  salePrice,
  defaultMarkupPercentage,
  form,
  setForm,
  isSubmitting,
  onSubmit,
}: Props) {
  const quantity = Number(form.quantity) || 0;
  const amount = Number(form.amount) || 0;
  const unitCost = quantity > 0 ? amount / quantity : 0;

  const suggestedSalePrice =
    unitCost > 0 && defaultMarkupPercentage != null
      ? unitCost + unitCost * (defaultMarkupPercentage / 100)
      : 0;

  const handleUpdateSalePriceChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      updateSalePrice: checked,
      newSalePrice:
        checked && suggestedSalePrice > 0
          ? suggestedSalePrice.toFixed(2)
          : prev.newSalePrice,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Registrar Compra
          </DialogTitle>
          <DialogDescription>Ingreso de stock al inventario</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-2">
          <FieldGroup className="space-y-5 py-4">
            <Field>
              <FieldLabel>Producto</FieldLabel>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{productName}</span>
              </div>
            </Field>

            <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/20 p-3 text-sm">
              <div>
                <p className="text-muted-foreground">Costo actual</p>
                <p className="font-semibold">
                  {costPrice != null ? currencyFormatter.format(costPrice) : "-"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Venta actual</p>
                <p className="font-semibold">
                  {salePrice != null ? currencyFormatter.format(salePrice) : "-"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Margen</p>
                <p className="font-semibold">
                  {defaultMarkupPercentage != null
                    ? `${defaultMarkupPercentage}%`
                    : "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Cantidad</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Monto total</FieldLabel>
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
                      setForm((p) => ({ ...p, amount: e.target.value }))
                    }
                  />
                </InputGroup>
              </Field>
            </div>

            {quantity > 0 && amount > 0 && (
              <div className="rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                <p className="text-sm text-muted-foreground">
                  Costo unitario:{" "}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {currencyFormatter.format(unitCost)}
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-3 rounded-lg border p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.updateCostPrice}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      updateCostPrice: e.target.checked,
                    }))
                  }
                />
                Actualizar costo del producto con esta compra
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.updateSalePrice}
                  onChange={(e) =>
                    handleUpdateSalePriceChange(e.target.checked)
                  }
                />
                Actualizar precio de venta público
              </label>

              {form.updateSalePrice && (
                <Field>
                  <FieldLabel>Nuevo precio de venta</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <DollarSign className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.newSalePrice}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          newSalePrice: e.target.value,
                        }))
                      }
                    />
                  </InputGroup>

                  {suggestedSalePrice > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Sugerido por margen actual:{" "}
                      <span className="font-medium">
                        {currencyFormatter.format(suggestedSalePrice)}
                      </span>
                    </p>
                  )}
                </Field>
              )}
            </div>

            <Field>
              <FieldLabel>Comentario (opcional)</FieldLabel>
              <Input
                placeholder="Notas sobre la compra..."
                value={form.comment}
                onChange={(e) =>
                  setForm((p) => ({ ...p, comment: e.target.value }))
                }
              />
            </Field>
          </FieldGroup>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Registrando...
              </>
            ) : (
              "Confirmar Compra"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}