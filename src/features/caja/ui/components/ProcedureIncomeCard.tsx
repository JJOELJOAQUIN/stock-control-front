"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Sparkles, Stethoscope } from "lucide-react";

import type { CashActor, PaymentMethod, ProcedureOption } from "../../types/cash.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { ProcedureCombobox } from "./ProcedureCombobox";
import {
  getPeelingSplit,
  isSplitPresetAllowed,
  PAYMENT_METHODS,
  PEELING_INSTALLMENT,
  PEELING_PAYMENT_OPTIONS,
  PEELING_PROTOCOLO_CODE,
  PEELING_TOTAL,
  peelingInstallmentLabel,
  splitPresetComment,
  splitPresetOptions,
  type PeelingPaymentKind,
  type SplitPreset,
} from "@/lib/peeling";


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
    performedBy: CashActor;
    splitPreset?: SplitPreset;
    peelingPaymentKind?: PeelingPaymentKind;
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
  const [peelingPayment, setPeelingPayment] = useState<PeelingPaymentKind>("FULL");
  const [splitPreset, setSplitPreset] = useState<SplitPreset>("NORMAL");

  const selected = useMemo(
    () => procedures.find((p) => p.code === procedureCode),
    [procedures, procedureCode]
  );
  const isPeeling = procedureCode === PEELING_PROTOCOLO_CODE;
  const parsedMultiplier = Math.max(1, Math.floor(Number(multiplier) || 1));
  const unitAmount = Number(amount) || 0;
  const totalPreview = isPeeling ? unitAmount : unitAmount * parsedMultiplier;
  const peelingSplit = useMemo(
    () => getPeelingSplit(Number(amount) || 0, peelingPayment, splitPreset),
    [amount, peelingPayment, splitPreset]
  );
  const presetOptions = useMemo(
    () => splitPresetOptions(Number(amount) || 0, peelingPayment),
    [amount, peelingPayment]
  );
  const isDeviation = splitPreset !== "NORMAL";

  /**
   * Autoría del trabajo. Sale del card, no del rol logueado: el catálogo ya
   * está partido por especialidad, así que el card sabe de quién es el trabajo
   * mejor que quien esté operando el sistema en ese momento.
   *
   * El peeling es la excepción: vive en el card de la médica pero lo hace
   * Gise. Sin este override, un peeling con "Todo a Pili" quedaría como
   * trabajo de la médica y desaparecería de la card de Gise — que es
   * exactamente el bug que este feature viene a cerrar.
   */
  const performedBy: CashActor =
    isPeeling ? "COSMETOLOGA" : variant === "cosmetologia" ? "COSMETOLOGA" : "MEDICA";

  const handleProcedureChange = (code: string) => {
    setProcedureCode(code);
    setMultiplier("1");
    setSplitPreset("NORMAL");
    const found = procedures.find((p) => p.code === code);
    if (code === PEELING_PROTOCOLO_CODE) {
      setPeelingPayment("FULL");
      setAmount(String(PEELING_TOTAL));
    } else if (found) {
      setAmount(String(found.amount));
    }
  };

  const handlePeelingPaymentChange = (kind: PeelingPaymentKind) => {
    setPeelingPayment(kind);
    setAmount(String(kind === "FULL" ? PEELING_TOTAL : PEELING_INSTALLMENT));
    // Si el desvío elegido no aplica a la cuota nueva, vuelve al reparto
    // normal en vez de quedar seleccionado y ser rechazado por el backend.
    if (!isSplitPresetAllowed(splitPreset, kind)) {
      setSplitPreset("NORMAL");
    }
  };

  const handleSubmit = async () => {
    if (!selected) return toast.error("Seleccioná un procedimiento");
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return toast.error("El monto debe ser mayor a cero");
    }

    if (isPeeling) {
      const split = getPeelingSplit(parsed, peelingPayment, splitPreset);
      const base =
        comment.trim() || `${selected.label} - ${peelingInstallmentLabel(peelingPayment)}`;
      const note = splitPresetComment(splitPreset);

      await onSubmit({
        procedure: selected,
        amount: parsed,
        paymentMethod,
        comment: note ? `${note} · ${base}` : base,
        // Los percents siguen viajando por compatibilidad, pero cuando hay
        // desvío el backend los ignora y manda el preset.
        doctorSharePercent: 1 - split.cosmologistPercent,
        cosmetologistSharePercent: split.cosmologistPercent,
        performedBy,
        splitPreset,
        peelingPaymentKind: peelingPayment,
      });
      setComment("");
      setSplitPreset("NORMAL");
      return;
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
      performedBy,
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
            {!isPeeling && (
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
            )}
            <Field>
              <FieldLabel>Monto {isPeeling ? "" : "unitario"}</FieldLabel>
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

          {!isPeeling && parsedMultiplier > 1 && totalPreview > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2 text-sm">
              <span className="text-muted-foreground">
                Total ({parsedMultiplier} × {currencyFormatter.format(unitAmount)})
              </span>
              <span className="font-semibold">{currencyFormatter.format(totalPreview)}</span>
            </div>
          )}

          {isPeeling && (
            <div
              className={
                "space-y-3 rounded-lg border p-3 " +
                (isDeviation
                  ? "border-amber-300 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/20"
                  : "border-sky-200/50 bg-sky-50/50 dark:border-sky-800/50 dark:bg-sky-950/20")
              }
            >
              <Field>
                <FieldLabel>Tipo de pago</FieldLabel>
                <Select value={peelingPayment} onValueChange={(v) => handlePeelingPaymentChange(v as PeelingPaymentKind)}>
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

              <Field>
                <FieldLabel>Reparto</FieldLabel>
                <Select value={splitPreset} onValueChange={(v) => setSplitPreset(v as SplitPreset)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {presetOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <SplitRow label="A cobrar" value={peelingSplit.amount} />
              <SplitRow label="Cosmetóloga" value={peelingSplit.cosmologistAmount} className="text-violet-600 dark:text-violet-400" />
              <SplitRow label="Médica" value={peelingSplit.doctorAmount} className="text-sky-600 dark:text-sky-400" />

              {isDeviation && (
                <div className="flex gap-2 rounded-md bg-amber-100/70 p-2 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Este pago se aparta del reparto habitual del peeling. El reparto real
                    no cambia: queda registrado como desvío, y la diferencia es una deuda
                    entre ustedes que el sistema todavía no lleva.
                  </span>
                </div>
              )}
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

function SplitRow({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${className ?? ""}`}>{currencyFormatter.format(value)}</span>
    </div>
  );
}