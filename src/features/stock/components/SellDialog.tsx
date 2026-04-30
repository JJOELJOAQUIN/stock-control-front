
import { Barcode, CreditCard, DollarSign, Banknote, Building2 } from "lucide-react";
import type { PaymentMethod } from "../types/stock.types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "CASH", label: "Efectivo", icon: <Banknote className="h-4 w-4" /> },
  { value: "TRANSFER", label: "Transferencia", icon: <Building2 className="h-4 w-4" /> },
  { value: "DEBIT", label: "Debito", icon: <CreditCard className="h-4 w-4" /> },
  { value: "CREDIT", label: "Credito", icon: <CreditCard className="h-4 w-4" /> },
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barcode: string;
  form: {
    quantity: string;
    amount: string;
    paymentMethod: PaymentMethod;
    comment: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    quantity: string;
    amount: string;
    paymentMethod: PaymentMethod;
    comment: string;
  }>>;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function SellDialog({
  open,
  onOpenChange,
  barcode,
  form,
  setForm,
  isSubmitting,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Registrar Venta
          </DialogTitle>
          <DialogDescription>
            Venta de producto por codigo de barras
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="space-y-5 py-4">
          <Field>
            <FieldLabel>Codigo de barras</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Barcode className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput value={barcode} disabled />
            </InputGroup>
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

          <Field>
            <FieldLabel>Metodo de pago</FieldLabel>
            <Select
              value={form.paymentMethod}
              onValueChange={(value) =>
                setForm((p) => ({ ...p, paymentMethod: value as PaymentMethod }))
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
            <FieldLabel>Comentario (opcional)</FieldLabel>
            <Input
              placeholder="Notas sobre la venta..."
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
