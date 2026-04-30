
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Spinner } from "@/shared/components/ui/spinner";
import { DollarSign, Package, ShoppingCart } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  form: {
    quantity: string;
    amount: string;
    comment: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    quantity: string;
    amount: string;
    comment: string;
  }>>;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function PurchaseDialog({
  open,
  onOpenChange,
  productName,
  form,
  setForm,
  isSubmitting,
  onSubmit,
}: Props) {
  const quantity = Number(form.quantity) || 0;
  const amount = Number(form.amount) || 0;
  const unitCost = quantity > 0 ? amount / quantity : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Registrar Compra
          </DialogTitle>
          <DialogDescription>
            Ingreso de stock al inventario
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="space-y-5 py-4">
          <Field>
            <FieldLabel>Producto</FieldLabel>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{productName}</span>
            </div>
          </Field>

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
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(unitCost)}
                </span>
              </p>
            </div>
          )}

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

        <DialogFooter>
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
