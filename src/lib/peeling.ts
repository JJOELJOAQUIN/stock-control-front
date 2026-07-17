import type {
  PaymentMethod,
  PeelingPaymentKind,
  ProcedureOption,
  SplitPreset,
} from "@/features/caja/types/cash.types";
import { currencyFormatter } from "@/lib/currencyFormatter";

// Los tipos viven en cash.types.ts (los usa el request de caja) y se
// re-exportan acá para no romper los imports que ya apuntan a este módulo.
export type { PeelingPaymentKind, SplitPreset };

export const PEELING_PROTOCOLO_CODE = "PEELING_PROFUNDO_PROTOCOLO";
export const PEELING_TOTAL = 170_000;
export const PEELING_INSTALLMENT = 85_000;
export const COSMETOLOGA_FIXED_SHARE = 40_000;

export const PEELING_PAYMENT_OPTIONS: { value: PeelingPaymentKind; label: string }[] = [
  { value: "FULL", label: "Pago completo" },
  { value: "FIRST", label: "Primera cuota" },
  { value: "SECOND", label: "Segunda cuota" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

export function getPeelingSplit(
  amount: number,
  kind: PeelingPaymentKind,
  preset: SplitPreset = "NORMAL"
) {
  const total = Number.isFinite(amount) ? amount : 0;

  // El default deja el comportamiento anterior intacto: cualquier llamada que
  // no pase preset cobra exactamente como cobraba antes de este feature.
  const cosmologistAmount =
    preset === "TODO_COSMETOLOGA"
      ? total
      : preset === "TODO_MEDICA"
        ? 0
        : kind === "SECOND"
          ? 0
          : Math.min(COSMETOLOGA_FIXED_SHARE, total);

  return {
    amount: total,
    cosmologistAmount,
    doctorAmount: total - cosmologistAmount,
    cosmologistPercent: total > 0 ? cosmologistAmount / total : 0,
  };
}

/**
 * "Todo a Gise" existe sólo para la primera cuota: es la que ella se cobra
 * entera para saldar arreglos previos con Pili. Ofrecerlo en un pago completo
 * sería ofrecer un desvío de $130.000 con la misma etiqueta que uno de
 * $45.000, y después no habría forma de distinguirlos en el registro.
 */
export function isSplitPresetAllowed(
  preset: SplitPreset,
  kind: PeelingPaymentKind
): boolean {
  return preset !== "TODO_COSMETOLOGA" || kind === "FIRST";
}

/** Opciones de reparto con el monto real que le queda a cada una. */
export function splitPresetOptions(
  amount: number,
  kind: PeelingPaymentKind
): { value: SplitPreset; label: string }[] {
  const normal = getPeelingSplit(amount, kind, "NORMAL");
  const total = Number.isFinite(amount) ? amount : 0;

  const options: { value: SplitPreset; label: string }[] = [
    {
      value: "NORMAL",
      label: `Reparto normal (${currencyFormatter.format(normal.cosmologistAmount)} a Gise)`,
    },
  ];

  if (isSplitPresetAllowed("TODO_COSMETOLOGA", kind)) {
    options.push({
      value: "TODO_COSMETOLOGA",
      label: `Todo a Gise (${currencyFormatter.format(total)})`,
    });
  }

  options.push({
    value: "TODO_MEDICA",
    label: `Todo a Pili (${currencyFormatter.format(0)} a Gise)`,
  });

  return options;
}

/** Texto corto del desvío, para prependear al comment. */
export function splitPresetComment(preset: SplitPreset): string | null {
  if (preset === "TODO_COSMETOLOGA") return "Reparto: Todo a Gise";
  if (preset === "TODO_MEDICA") return "Reparto: Todo a Pili";
  return null;
}

export function peelingInstallmentLabel(kind: PeelingPaymentKind): string {
  return kind === "FULL" ? "pago completo" : kind === "FIRST" ? "1ª cuota" : "2ª cuota";
}

export function filterProcedures(procedures: ProcedureOption[], term: string) {
  const q = term.trim().toLowerCase();
  return q ? procedures.filter((p) => p.label.toLowerCase().includes(q)) : procedures;
}