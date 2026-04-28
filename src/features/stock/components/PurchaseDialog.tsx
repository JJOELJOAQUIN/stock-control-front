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

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  form: {
    quantity: string;
    amount: string;
    comment: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar compra</DialogTitle>
          <DialogDescription>Ingreso de stock</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Producto</Label>
            <Input value={productName} disabled />
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
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}