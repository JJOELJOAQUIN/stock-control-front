import { useState } from "react";
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

import { PatientPicker } from "./PatientPicker";
import {
  DEFAULT_COSMETOLOGIST_FIXED_SHARE,
  PEELING_PROFUNDO,
  type Patient,
} from "../models/treatment";
import type { RegisterTreatmentInput } from "../hooks/useTreatmentsPage";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: RegisterTreatmentInput) => Promise<boolean>;
  isSubmitting: boolean;
};

const DEFAULT_PEELING_TOTAL = 170000;

export function RegisterTreatmentDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: Props) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [total, setTotal] = useState(String(DEFAULT_PEELING_TOTAL));
  const [fixedShare, setFixedShare] = useState(String(DEFAULT_COSMETOLOGIST_FIXED_SHARE));
  const [firstAmount, setFirstAmount] = useState("");
  const [firstMethod, setFirstMethod] = useState<PaymentMethod>("CASH");
  const [attempted, setAttempted] = useState(false);


  const reset = () => {
    setPatient(null);
    setTotal(String(DEFAULT_PEELING_TOTAL));
    setFixedShare(String(DEFAULT_COSMETOLOGIST_FIXED_SHARE));
    setFirstAmount("");
    setFirstMethod("CASH");
    setAttempted(false);
  };

  const totalNum = Number(total) || 0;
  const firstNum = Number(firstAmount) || 0;
  const patientError = attempted && !patient;

  const handleSubmit = async () => {
    setAttempted(true);
    if (!patient) {
      toast.error("El peeling profundo requiere un paciente");
      return;
    }
    if (totalNum <= 0) {
      toast.error("Ingresá el monto total");
      return;
    }
    if (firstNum > totalNum) {
      toast.error("El primer pago no puede superar el total");
      return;
    }

    const ok = await onSubmit({
      treatment: {
        patientId: patient.id,
        code: PEELING_PROFUNDO.code,
        description: PEELING_PROFUNDO.label,
        totalAmount: totalNum,
        cosmetologistFixedShare: Number(fixedShare) || null,
        maxInstallments: 2,
      },
      firstPaymentAmount: firstNum > 0 ? firstNum : null,
      firstPaymentMethod: firstNum > 0 ? firstMethod : null,
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
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Registrar peeling profundo</DialogTitle>
          <DialogDescription>
            Protocolo con paciente obligatorio y parte fija de la cosmetóloga.
          </DialogDescription>
        </DialogHeader>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="space-y-1.5">
            <Label>Paciente</Label>
            <PatientPicker selected={patient} onSelect={setPatient} />
            {patientError && (
              <span className="text-xs font-light text-destructive">
                Elegí o creá un paciente
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Monto total</Label>
              <Input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parte cosmetóloga (fija)</Label>
              <Input
                type="number"
                value={fixedShare}
                onChange={(e) => setFixedShare(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Primer pago (opcional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Monto</Label>
                <Input
                  type="number"
                  value={firstAmount}
                  onChange={(e) => setFirstAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Método</Label>
                <Select value={firstMethod} onValueChange={(v) => setFirstMethod(v as PaymentMethod)}>
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
            {firstNum > 0 && totalNum > 0 && (
              <p className="text-xs text-muted-foreground">
                Queda un saldo pendiente de{" "}
                {currencyFormatter.format(Math.max(totalNum - firstNum, 0))}.
              </p>
            )}
          </div>
        </div>

        {/* Footer fijo */}
        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}