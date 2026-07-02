// features/treatments/ui/components/RegisterTreatmentDialog.tsx
import { useState } from "react";
import { toast } from "sonner";

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
import { PAYMENT_METHODS } from "@/lib/sale";
import { currencyFormatter } from "@/lib/currencyFormatter";
import type { PaymentMethod } from "@/features/caja/types/cash.types";

import { PatientPicker } from "./PatientPicker";
import { DEFAULT_COSMETOLOGIST_FIXED_SHARE, type CreateTreatmentRequest, PEELING_PROFUNDO, type Patient } from "../models/treatment";


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: CreateTreatmentRequest) => Promise<boolean>;
  isSubmitting: boolean;
};

export function RegisterTreatmentDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: Props) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [total, setTotal] = useState("");
  const [fixedShare, setFixedShare] = useState(
    String(DEFAULT_COSMETOLOGIST_FIXED_SHARE)
  );
  const [firstAmount, setFirstAmount] = useState("");
  const [firstMethod, setFirstMethod] = useState<PaymentMethod>("CASH");

  const reset = () => {
    setPatient(null);
    setTotal("");
    setFixedShare(String(DEFAULT_COSMETOLOGIST_FIXED_SHARE));
    setFirstAmount("");
    setFirstMethod("CASH");
  };

  const totalNum = Number(total) || 0;
  const firstNum = Number(firstAmount) || 0;

  const handleSubmit = async () => {
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

    const body: CreateTreatmentRequest = {
      procedureCode: PEELING_PROFUNDO.code,
      procedureLabel: PEELING_PROFUNDO.label,
      patientId: patient.id,
      context: "CONSULTORIO",
      totalAmount: totalNum,
      cosmetologistFixedShare: Number(fixedShare) || null,
      firstPaymentAmount: firstNum > 0 ? firstNum : null,
      firstPaymentMethod: firstNum > 0 ? firstMethod : null,
    };

    const ok = await onSubmit(body);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar peeling profundo</DialogTitle>
          <DialogDescription>
            Protocolo con paciente obligatorio y parte fija de la cosmetóloga.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Paciente</Label>
            <PatientPicker selected={patient} onSelect={setPatient} />
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
                <Select
                  value={firstMethod}
                  onValueChange={(v) => setFirstMethod(v as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
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

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}