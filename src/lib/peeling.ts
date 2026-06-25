import type { PaymentMethod, ProcedureOption } from "@/features/caja/types/cash.types";

export const PEELING_PROTOCOLO_CODE = "PEELING_PROFUNDO_PROTOCOLO";
export const PEELING_TOTAL = 170_000;
export const PEELING_INSTALLMENT = 85_000;
export const COSMETOLOGA_FIXED_SHARE = 40_000;

export type PeelingPaymentKind = "FULL" | "FIRST" | "SECOND";

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

export function getPeelingSplit(amount: number, kind: PeelingPaymentKind) {
  const total = Number.isFinite(amount) ? amount : 0;
  const cosmologistAmount =
    kind === "SECOND" ? 0 : Math.min(COSMETOLOGA_FIXED_SHARE, total);

  return {
    amount: total,
    cosmologistAmount,
    doctorAmount: total - cosmologistAmount,
    cosmologistPercent: total > 0 ? cosmologistAmount / total : 0,
  };
}

export function peelingInstallmentLabel(kind: PeelingPaymentKind): string {
  return kind === "FULL" ? "pago completo" : kind === "FIRST" ? "1ª cuota" : "2ª cuota";
}

export function filterProcedures(procedures: ProcedureOption[], term: string) {
  const q = term.trim().toLowerCase();
  return q ? procedures.filter((p) => p.label.toLowerCase().includes(q)) : procedures;
}