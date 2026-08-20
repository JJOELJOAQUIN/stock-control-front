import type { PaymentMethod, CashContext } from "@/features/caja/types/cash.types";
import { currencyFormatter } from "@/lib/currencyFormatter";

export type TreatmentStatus = "PENDIENTE" | "PARCIAL" | "COMPLETO";

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string | null;
  phone?: string | null;
};

export type CreatePatientRequest = {
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
};

export type TreatmentPayment = {
  id: string;
  amount: number;
  paymentMethod: string;
  installmentNumber: number;
  cashMovementId?: string | null;
};

export type Treatment = {
  id: string;
  patientId: string;
  patientName: string;
  code: string;
  description?: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  cosmetologistFixedShare?: number | null;
  maxInstallments: number;
  paymentsCount: number;
  status: TreatmentStatus;
};

export type CreateTreatmentRequest = {
  patientId: string;
  code: string;
  description?: string;
  totalAmount: number;
  cosmetologistFixedShare?: number | null;
  maxInstallments?: number;
};

/**
 * Reparto de un pago de peeling.
 *
 * NORMAL no es un porcentaje: es el monto fijo del tratamiento
 * (cosmetologistFixedShare) en la primera cuota, y $0 en las siguientes.
 * Los otros dos valores marcan un desvío deliberado, que el backend sólo
 * acepta en un peeling y —para TODO_COSMETOLOGA— sólo en la primera cuota.
 */
export type SplitPreset = "NORMAL" | "TODO_COSMETOLOGA" | "TODO_MEDICA";

export type RegisterPaymentRequest = {
  amount: number;
  paymentMethod: PaymentMethod;
  context: CashContext;
  splitPreset?: SplitPreset | null;
};

export const PEELING_PROFUNDO = {
  code: "PEELING_PROFUNDO_PROTOCOLO",
  label: "PROTOCOLO PEELING PROFUNDO",
} as const;

export const DEFAULT_COSMETOLOGIST_FIXED_SHARE = 40000;

/**
 * Opción de reparto para el selector. `label` es el nombre corto que se ve
 * en el combo; `detail` es UNA frase que dice, de forma determinística, a
 * dónde va la plata de ESTE pago. La frase se muestra bajo el selector para
 * que Pili y Gise lean quién cobra antes de confirmar.
 */
export type SplitPresetOption = {
  value: SplitPreset;
  label: string;
  detail: string;
};

/**
 * Opciones de reparto para un pago, ya resueltas para el momento exacto
 * (primera cuota o no) y el fijo de ESTE tratamiento. Cada opción trae su
 * frase determinística: el mismo preset "Normal" reparte distinto en la
 * primera cuota que en las siguientes, y esa diferencia se explica acá en
 * vez de quedar escondida en la palabra "Normal".
 *
 * Los desvíos hablan de "neto" y no del monto cobrado: el neto depende de la
 * retención del método de pago (30% en tarjeta), así que poner el bruto
 * mentiría en todo lo que no sea efectivo.
 */
export function splitPresetOptions(
  isFirstPayment: boolean,
  cosmetologistFixedShare: number | null | undefined
): SplitPresetOption[] {
  const fixed = cosmetologistFixedShare ?? 0;

  // NORMAL: en la primera cuota Gise cobra su fijo y Pili el resto; en las
  // cuotas siguientes Gise ya cobró, así que el pago va entero a Pili.
  const normalDetail =
    isFirstPayment && fixed > 0
      ? `Gise cobra ${currencyFormatter.format(fixed)} y Pili el resto de este pago.`
      : isFirstPayment
        ? "Este pago va entero a Pili (no hay fijo de Gise cargado)."
        : "Este pago va entero a Pili — Gise ya cobró su parte en la primera cuota.";

  const options: SplitPresetOption[] = [
    {
      value: "NORMAL",
      label: "Reparto habitual",
      detail: normalDetail,
    },
  ];

  // Los desvíos dicen QUIÉN cobra todo en una frase, sin ambigüedad: "Todo a
  // Gise" y "Todo a Pili" se parecen demasiado leídos al pasar, y elegir el
  // equivocado mueve el neto entero de una a la otra.
  if (isFirstPayment) {
    options.push({
      value: "TODO_COSMETOLOGA",
      label: "Desvío · todo para Gise",
      detail: "Este pago entero va a Gise. Pili no cobra nada de esta cuota.",
    });
  }

  options.push({
    value: "TODO_MEDICA",
    label: "Desvío · todo para Pili",
    detail: "Este pago entero va a Pili. Gise no cobra nada de esta cuota.",
  });

  return options;
}

export function isSplitPresetAllowed(preset: SplitPreset, isFirstPayment: boolean): boolean {
  return preset !== "TODO_COSMETOLOGA" || isFirstPayment;
}

/** Sólo el peeling admite desvíos; el selector no se muestra para otros códigos. */
export function supportsSplitPreset(treatmentCode: string): boolean {
  return treatmentCode === PEELING_PROFUNDO.code;
}