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
import type { PaymentMethod } from "@/features/caja/types/cash.types";

import { PatientPicker } from "./PatientPicker";
import {
  DEFAULT_TOXINA_TOTAL,
  DEFAULT_UNITS_PER_SESSION,
  type RegisterToxinaInput,
} from "../models/toxina";
import type { Patient } from "../models/treatment";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: RegisterToxinaInput) => Promise<boolean>;
  isSubmitting: boolean;
};

/**
 * Todo en un modal: paciente, unidades de la 1ª sesión y el pago único. A
 * diferencia de peeling, acá el alta ya deja la primera sesión registrada.
 */
export function RegisterToxinaDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: Props) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [total, setTotal] = useState(String(DEFAULT_TOXINA_TOTAL));
  const [units, setUnits] = useState(String(DEFAULT_UNITS_PER_SESSION));
  // Normalmente se paga todo en la 1ª sesión: arrancamos con el total cargado.
  const [payAmount, setPayAmount] = useState(String(DEFAULT_TOXINA_TOTAL));
  const [payMethod, setPayMethod] = useState<PaymentMethod>("CASH");
  const [attempted, setAttempted] = useState(false);

  const reset = () => {
    setPatient(null);
    setTotal(String(DEFAULT_TOXINA_TOTAL));
    setUnits(String(DEFAULT_UNITS_PER_SESSION));
    setPayAmount(String(DEFAULT_TOXINA_TOTAL));
    setPayMethod("CASH");
    setAttempted(false);
  };

  const totalNum = Number(total) || 0;
  const unitsNum = Number(units) || 0;
  const payNum = Number(payAmount) || 0;
  const patientError = attempted && !patient;

  const handleSubmit = async () => {
    setAttempted(true);
    if (!patient) {
      toast.error("La toxina requiere un paciente");
      return;
    }
    if (unitsNum <= 0) {
      toast.error("Ingresá las unidades de la sesión");
      return;
    }
    if (payNum > totalNum) {
      toast.error("El pago no puede superar el total");
      return;
    }

    const ok = await onSubmit({
      patientId: patient.id,
      totalAmount: totalNum,
      firstSessionUnits: unitsNum,
      paymentAmount: payNum > 0 ? payNum : null,
      paymentMethod: payNum > 0 ? payMethod : null,
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
          <DialogTitle>Registrar toxina</DialogTitle>
          <DialogDescription>
            Paciente, primera sesión y pago en un solo paso.
          </DialogDescription>
        </DialogHeader>

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
              <Label>Unidades (1ª sesión)</Label>
              <Input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="25"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Monto del tratamiento</Label>
              <Input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Pago</p>
              <button
                type="button"
                onClick={() => setPayAmount(total)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Cobrar todo
              </button>
            </div>
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
            <p className="text-xs text-muted-foreground">
              Si no cobrás ahora, podés hacerlo al registrar la 2ª sesión.
            </p>
          </div>
        </div>

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