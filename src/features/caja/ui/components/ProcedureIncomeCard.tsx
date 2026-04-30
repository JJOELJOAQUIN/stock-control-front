"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Stethoscope, Sparkles } from "lucide-react";
import type { PaymentMethod, ProcedureOption } from "../../types/cash.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";



const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

type Props = {
  title: string;
  description: string;
  procedures: ProcedureOption[];
  doctorSharePercent: number;
  cosmetologistSharePercent: number;
  isSubmitting: boolean;
  variant?: "cosmetologia" | "medica";
  onSubmit: (payload: {
    procedure: ProcedureOption;
    amount: number;
    paymentMethod: PaymentMethod;
    comment?: string;
    doctorSharePercent: number;
    cosmetologistSharePercent: number;
  }) => Promise<void>;
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
  const initialProcedure = procedures[0];

  const [procedureCode, setProcedureCode] = useState(
    initialProcedure?.code ?? ""
  );
  const [amount, setAmount] = useState(String(initialProcedure?.amount ?? 0));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [comment, setComment] = useState("");

  const selectedProcedure = useMemo(
    () => procedures.find((p) => p.code === procedureCode),
    [procedures, procedureCode]
  );

  const handleProcedureChange = (code: string) => {
    setProcedureCode(code);
    const found = procedures.find((p) => p.code === code);
    if (found) {
      setAmount(String(found.amount));
    }
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);

    if (!selectedProcedure) {
      toast.error("Seleccioná un procedimiento");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    await onSubmit({
      procedure: selectedProcedure,
      amount: parsedAmount,
      paymentMethod,
      comment: comment.trim(),
      doctorSharePercent,
      cosmetologistSharePercent,
    });

    setComment("");
  };

  const Icon = variant === "medica" ? Stethoscope : Sparkles;
  const accentColor =
    variant === "medica"
      ? "text-sky-600 dark:text-sky-400"
      : "text-violet-600 dark:text-violet-400";
  const bgColor =
    variant === "medica"
      ? "bg-sky-100 dark:bg-sky-900/50"
      : "bg-violet-100 dark:bg-violet-900/50";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-lg ${bgColor} ${accentColor}`}
          >
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field>
              <FieldLabel>Procedimiento</FieldLabel>
              <Select value={procedureCode} onValueChange={handleProcedureChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar procedimiento" />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Monto</FieldLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Método de pago</FieldLabel>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
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
          </div>

          <Field>
            <FieldLabel>Comentario (opcional)</FieldLabel>
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Agregar nota o comentario..."
            />
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
