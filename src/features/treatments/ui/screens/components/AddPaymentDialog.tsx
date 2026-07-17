import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Spinner } from "@/shared/components/ui/spinner";
import { PAYMENT_METHODS } from "@/lib/sale";
import { currencyFormatter } from "@/lib/currencyFormatter";
import type { PaymentMethod } from "@/features/caja/types/cash.types";

import { AlertTriangle } from "lucide-react";
import { isSplitPresetAllowed, splitPresetOptions, supportsSplitPreset, type SplitPreset, type Treatment } from "../models/treatment";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: Treatment | null;
  isPaying: boolean;
  onPay: (
    treatmentId: string,
    amount: number,
    method: PaymentMethod,
    splitPreset: SplitPreset | null
  ) => Promise<boolean>;
};

export function AddPaymentDialog({ open, onOpenChange, treatment, isPaying, onPay }: Props) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [splitPreset, setSplitPreset] = useState<SplitPreset>("NORMAL");

  // La cuota la decide el backend contando los pagos existentes; acá sólo
  // anticipamos cuál va a ser para mostrar las opciones correctas.
  const isFirstPayment = (treatment?.paymentsCount ?? 0) === 0;

  const presetOptions = useMemo(
    () => splitPresetOptions(isFirstPayment, treatment?.cosmetologistFixedShare),
    [isFirstPayment, treatment?.cosmetologistFixedShare]
  );

  if (!treatment) return null;

  const showSplitPreset = supportsSplitPreset(treatment.code);
  const isDeviation = splitPreset !== "NORMAL";

  const remaining = treatment.remainingAmount;
  const amountNum = Number(amount) || 0;
  const over = amountNum > remaining;

  const reset = () => {
    setAmount("");
    setMethod("CASH");
    setSplitPreset("NORMAL");
  };

  const handlePay = async () => {
    if (amountNum <= 0 || over) return;
    // Si el desvío dejó de aplicar (cambió la cuota mientras el dialog estaba
    // abierto), mandamos NORMAL en vez de que el backend lo rechace.
    const preset = isSplitPresetAllowed(splitPreset, isFirstPayment) ? splitPreset : "NORMAL";
    const ok = await onPay(treatment.id, amountNum, method, showSplitPreset ? preset : null);
    if (ok) {
      reset();
      onOpenChange(false);
    }
  };

  const fillRemaining = () => setAmount(String(remaining));

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
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>{treatment.patientName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumen de saldo */}
          <div className="grid grid-cols-3 gap-2 rounded-lg border p-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold tabular-nums">
                {currencyFormatter.format(treatment.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pagado</p>
              <p className="font-semibold tabular-nums">
                {currencyFormatter.format(treatment.paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Falta</p>
              <p className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {currencyFormatter.format(remaining)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Monto del pago</Label>
              <button
                type="button"
                onClick={fillRemaining}
                className="text-xs text-primary hover:underline"
              >
                Pagar saldo completo
              </button>
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={over ? "border-destructive" : ""}
            />
            {over && (
              <span className="text-xs font-light text-destructive">
                El pago supera el saldo pendiente
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Método de pago</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
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
          {showSplitPreset && (
            <div
              className={
                "space-y-3 rounded-lg border p-3 " +
                (isDeviation
                  ? "border-amber-300 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/20"
                  : "")
              }
            >
              <div className="space-y-1.5">
                <Label>Reparto</Label>
                <Select value={splitPreset} onValueChange={(v) => setSplitPreset(v as SplitPreset)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {presetOptions.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isDeviation && (
                <div className="flex gap-2 rounded-md bg-amber-100/70 p-2 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Este pago se aparta del reparto habitual. El reparto real del peeling
                    no cambia: queda registrado como desvío, y la diferencia es una deuda
                    entre ustedes que el sistema todavía no lleva.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePay} disabled={isPaying || amountNum <= 0 || over}>
            {isPaying && <Spinner className="h-4 w-4" />}
            Registrar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}