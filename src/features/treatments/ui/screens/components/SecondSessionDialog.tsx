import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PAYMENT_METHODS } from "@/lib/sale";
import { currencyFormatter } from "@/lib/currencyFormatter";
import type { PaymentMethod } from "@/features/caja/types/cash.types";

import {
  DEFAULT_UNITS_PER_SESSION,
  isPaid,
  type RegisterSecondSessionInput,
  type ToxinaTreatment,
} from "../models/toxina";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: ToxinaTreatment | null;
  onSubmit: (input: RegisterSecondSessionInput) => Promise<boolean>;
  isSubmitting: boolean;
};

/**
 * 2ª sesión: unidades + (si el tratamiento todavía no se cobró) el pago único.
 */
export function SecondSessionDialog({
  open,
  onOpenChange,
  treatment,
  onSubmit,
  isSubmitting,
}: Props) {
  const [units, setUnits] = useState(String(DEFAULT_UNITS_PER_SESSION));
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("CASH");

  const pending = treatment ? Math.max(treatment.totalAmount - treatment.paidAmount, 0) : 0;
  const canPay = !!treatment && !isPaid(treatment);

  // Al abrir con un tratamiento sin cobrar, sugiere el saldo como monto.
  useEffect(() => {
    if (open && canPay) setPayAmount(String(pending));
    if (open && !canPay) setPayAmount("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, treatment?.id]);

  const reset = () => {
    setUnits(String(DEFAULT_UNITS_PER_SESSION));
    setPayAmount("");
    setPayMethod("CASH");
  };

  const unitsNum = Number(units) || 0;
  const payNum = Number(payAmount) || 0;

  const handleSubmit = async () => {
    if (!treatment) return;
    if (unitsNum <= 0) {
      toast.error("Ingresá las unidades de la sesión");
      return;
    }
    if (payNum > pending) {
      toast.error("El pago no puede superar el saldo");
      return;
    }

    const ok = await onSubmit({
      treatmentId: treatment.id,
      units: unitsNum,
      paymentAmount: canPay && payNum > 0 ? payNum : null,
      paymentMethod: canPay && payNum > 0 ? payMethod : null,
    });

    if (ok) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>2ª sesión de toxina</DialogTitle>
          <DialogDescription>
            {treatment?.patientName} — descuenta del vial abierto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Unidades</Label>
            <Input
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="25"
            />
          </div>

          {canPay ? (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">
                Cobro (opcional) — saldo {currencyFormatter.format(pending)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Monto</Label>
                  <Input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Método</Label>
                  <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m: { value: string; label: string }) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Este tratamiento ya está cobrado.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Registrar 2ª sesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}