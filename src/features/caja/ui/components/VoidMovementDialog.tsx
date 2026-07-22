import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { currencyFormatter } from "@/lib/currencyFormatter";
import type { CashMovementResponse } from "../../types/cash.types";

type Props = {
  movement: CashMovementResponse | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string, reason: string) => Promise<void>;
  isVoiding: boolean;
};

export function VoidMovementDialog({
  movement,
  onOpenChange,
  onConfirm,
  isVoiding,
}: Props) {
  const [reason, setReason] = useState("");

  if (!movement) return null;

  const isPurchase = movement.source === "PROVIDER_PAYMENT";

  const handleConfirm = async () => {
    // El motivo también es obligatorio en el backend: sin él la anulación no
    // cuenta nada y en un mes nadie se acuerda de por qué se anuló.
    if (!reason.trim()) {
      toast.error("Contá por qué se anula — queda en el registro");
      return;
    }
    await onConfirm(movement.id, reason.trim());
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={!!movement}
      onOpenChange={(o) => {
        if (!o) setReason("");
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Anular movimiento</DialogTitle>
          <DialogDescription>
            {movement.detail || movement.comment || movement.source} ·{" "}
            {currencyFormatter.format(Number(movement.amount))}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 rounded-md bg-amber-100/70 p-2 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Queda tachado y fuera de todos los totales, y no se puede
            des-anular. Si tenía stock asociado vuelve a sus lotes; si era un
            pago de tratamiento, el saldo del paciente se recalcula.
            {isPurchase &&
              " Es una compra: se anula sólo la plata, el stock que entró se corrige a mano."}
          </span>
        </div>

        <div className="space-y-1.5">
          <Label>Motivo</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: se cargó dos veces"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isVoiding}>
            Anular
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}