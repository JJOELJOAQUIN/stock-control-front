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

// Procedimiento con reparto especial: la cosmetóloga se lleva un monto fijo
// y admite pago en cuotas. La cosmetóloga cobra su parte en el primer pago.
const PEELING_PROTOCOLO_CODE = "PEELING_PROFUNDO_PROTOCOLO";
const PEELING_TOTAL = 170000;
const PEELING_INSTALLMENT = 85000;
const COSMETOLOGA_FIXED_SHARE = 40000;

type PeelingPaymentKind = "FULL" | "FIRST" | "SECOND";

const PEELING_PAYMENT_OPTIONS: { value: PeelingPaymentKind; label: string }[] = [
  { value: "FULL", label: "Pago completo" },
  { value: "FIRST", label: "Primera cuota" },
  { value: "SECOND", label: "Segunda cuota" },
];

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
});

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
  const [peelingPayment, setPeelingPayment] =
    useState<PeelingPaymentKind>("FULL");

  const selectedProcedure = useMemo(
    () => procedures.find((p) => p.code === procedureCode),
    [procedures, procedureCode]
  );

  const isPeeling = procedureCode === PEELING_PROTOCOLO_CODE;

  // Reparto del peeling según el tipo de pago. La cosmetóloga cobra sus
  // $40.000 en el primer pago (o en el pago completo); la segunda cuota va
  // entera a la médica. Devuelve montos y el porcentaje equivalente que
  // espera el backend.
  const peelingSplit = useMemo(() => {
    const total = peelingPayment === "FULL" ? PEELING_TOTAL : PEELING_INSTALLMENT;
    const cosmeShare = peelingPayment === "SECOND" ? 0 : COSMETOLOGA_FIXED_SHARE;
    const cosmePercent = total > 0 ? cosmeShare / total : 0;

    return {
      amount: total,
      cosmologistAmount: cosmeShare,
      doctorAmount: total - cosmeShare,
      cosmetologistSharePercent: cosmePercent,
      doctorSharePercent: 1 - cosmePercent,
    };
  }, [peelingPayment]);

  const handleProcedureChange = (code: string) => {
    setProcedureCode(code);
    const found = procedures.find((p) => p.code === code);
    if (found) {
      setAmount(String(found.amount));
    }
    // Al elegir el peeling, arrancamos en "pago completo".
    if (code === PEELING_PROTOCOLO_CODE) {
      setPeelingPayment("FULL");
      setAmount(String(PEELING_TOTAL));
    }
  };

  const handlePeelingPaymentChange = (kind: PeelingPaymentKind) => {
    setPeelingPayment(kind);
    setAmount(
      String(kind === "FULL" ? PEELING_TOTAL : PEELING_INSTALLMENT)
    );
  };

  const handleSubmit = async () => {
    if (!selectedProcedure) {
      toast.error("Seleccioná un procedimiento");
      return;
    }

    // Caso especial: peeling protocolo con reparto fijo y cuotas.
    if (isPeeling) {
      const installmentLabel =
        peelingPayment === "FULL"
          ? "pago completo"
          : peelingPayment === "FIRST"
            ? "1ª cuota"
            : "2ª cuota";

      await onSubmit({
        procedure: selectedProcedure,
        amount: peelingSplit.amount,
        paymentMethod,
        comment:
          comment.trim() ||
          `${selectedProcedure.label} - ${installmentLabel}`,
        doctorSharePercent: peelingSplit.doctorSharePercent,
        cosmetologistSharePercent: peelingSplit.cosmetologistSharePercent,
      });

      setComment("");
      return;
    }

    // Resto de procedimientos: comportamiento normal.
    const parsedAmount = Number(amount);

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
                disabled={isPeeling}
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

          {/* Caso especial: peeling protocolo con cuotas y reparto fijo */}
          {isPeeling && (
            <div className="space-y-3 rounded-lg border border-sky-200/50 bg-sky-50/50 p-3 dark:border-sky-800/50 dark:bg-sky-950/20">
              <Field>
                <FieldLabel>Tipo de pago</FieldLabel>
                <Select
                  value={peelingPayment}
                  onValueChange={(v) =>
                    handlePeelingPaymentChange(v as PeelingPaymentKind)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PEELING_PAYMENT_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">A cobrar</span>
                <span className="font-semibold">
                  {currencyFormatter.format(peelingSplit.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cosmetóloga</span>
                <span className="font-medium text-violet-600 dark:text-violet-400">
                  {currencyFormatter.format(peelingSplit.cosmologistAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Médica</span>
                <span className="font-medium text-sky-600 dark:text-sky-400">
                  {currencyFormatter.format(peelingSplit.doctorAmount)}
                </span>
              </div>
            </div>
          )}

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