"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Stethoscope } from "lucide-react";

import type { PaymentMethod, ProcedureOption } from "../../types/cash.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { ProcedureCombobox } from "./ProcedureCombobox";
import { PAYMENT_METHODS } from "@/lib/peeling";

// El peeling profundo NO se cobra desde acá: se registra como tratamiento
// (paciente + cuotas + saldo) en la sección Tratamientos, que es donde vive el
// reparto entre Pili y Gise. Este card cobra procedimientos sueltos.


type Variant = "cosmetologia" | "medica";

type Props = {
  title: string;
  description: string;
  procedures: ProcedureOption[];
  doctorSharePercent: number;
  cosmetologistSharePercent: number;
  isSubmitting: boolean;
  variant?: Variant;
  onSubmit: (payload: {
    procedure: ProcedureOption;
    amount: number;
    paymentMethod: PaymentMethod;
    comment?: string;
    doctorSharePercent: number;
    cosmetologistSharePercent: number;
  }) => Promise<void>;
};

const VARIANT_STYLES: Record<Variant, { Icon: typeof Sparkles; box: string }> = {
  medica: { Icon: Stethoscope, box: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400" },
  cosmetologia: { Icon: Sparkles, box: "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400" },
};

export function ProcedureIncomeCard({
  title,
  description,
  procedures,
  doctorSharePercent,
  cosmetologistSharePercent,
  isSubmitting,
  variant = "cosmetologia",
  onSubmit,
}: Props) {
  const initial = procedures[0];
  const [procedureCode, setProcedureCode] = useState(initial?.code ?? "");
  const [amount, setAmount] = useState(String(initial?.amount ?? 0));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [comment, setComment] = useState("");
  const [multiplier, setMultiplier] = useState("1");

  const selected = useMemo(
    () => procedures.find((p) => p.code === procedureCode),
    [procedures, procedureCode]
  );
  const parsedMultiplier = Math.max(1, Math.floor(Number(multiplier) || 1));
  const unitAmount = Number(amount) || 0;
  const totalPreview = unitAmount * parsedMultiplier;

  const handleProcedureChange = (code: string) => {
    setProcedureCode(code);
    setMultiplier("1");
    const found = procedures.find((p) => p.code === code);
    if (found) {
      setAmount(String(found.amount));
    }
  };

  const handleSubmit = async () => {
    if (!selected) return toast.error("Seleccioná un procedimiento");
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return toast.error("El monto debe ser mayor a cero");
    }

    const total = parsed * parsedMultiplier;
    const base = comment.trim() || selected.label;
    await onSubmit({
      procedure: selected,
      amount: total,
      paymentMethod,
      comment: parsedMultiplier > 1 ? `${base} ×${parsedMultiplier}` : base,
      doctorSharePercent,
      cosmetologistSharePercent,
    });
    setComment("");
    setMultiplier("1");
  };

  const { Icon, box } = VARIANT_STYLES[variant];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-lg ${box}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-4">
          {/* Filas más compactas: 2 columnas en vez de 4 estiradas */}
          <Field>
            <FieldLabel>Procedimiento</FieldLabel>
            <ProcedureCombobox
              procedures={procedures}
              value={procedureCode}
              onChange={handleProcedureChange}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Cantidad (×)</FieldLabel>
              <Input
                type="number"
                min="1"
                step="1"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Monto unitario</FieldLabel>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
          </div>

          <Field>
            <FieldLabel>Método de pago</FieldLabel>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {parsedMultiplier > 1 && totalPreview > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2 text-sm">
              <span className="text-muted-foreground">
                Total ({parsedMultiplier} × {currencyFormatter.format(unitAmount)})
              </span>
              <span className="font-semibold">{currencyFormatter.format(totalPreview)}</span>
            </div>
          )}

          <Field>
            <FieldLabel>Comentario (opcional)</FieldLabel>
            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Agregar nota..." />
          </Field>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Registrar ingreso
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}