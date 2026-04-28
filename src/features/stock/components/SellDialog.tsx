import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { PaymentMethod } from "../types/stock.types";

const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "TRANSFER",
  "DEBIT",
  "CREDIT",
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
  setForm: React.Dispatch<React.SetStateAction<any>>;
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar venta</DialogTitle>
          <DialogDescription>Venta por barcode</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Barcode</Label>
            <Input value={barcode} disabled />
          </div>

          <div>
            <Label>Cantidad</Label>
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm((p: any) => ({ ...p, quantity: e.target.value }))
              }
            />
          </div>

          <div>
            <Label>Monto</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((p: any) => ({ ...p, amount: e.target.value }))
              }
            />
          </div>

          <div>
            <Label>Método de pago</Label>
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm((p: any) => ({
                  ...p,
                  paymentMethod: e.target.value as PaymentMethod,
                }))
              }
              className="input"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Comentario</Label>
            <Input
              value={form.comment}
              onChange={(e) =>
                setForm((p: any) => ({ ...p, comment: e.target.value }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            Confirmar venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}