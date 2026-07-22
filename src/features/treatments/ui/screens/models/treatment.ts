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
 * Las etiquetas se arman con el monto real y no con un porcentaje escrito a
 * mano: es plata que Pili y Gise leen para decidir, y el peeling nunca se
 * repartió por porcentaje.
 *
 * Los desvíos se etiquetan como "neto entero" y no con el monto cobrado
 * porque el neto depende de la retención del método de pago (30% en tarjeta),
 * y poner el bruto sería mentir en los casos que no son efectivo.
 */
export function splitPresetOptions(
  isFirstPayment: boolean,
  cosmetologistFixedShare: number | null | undefined
): { value: SplitPreset; label: string }[] {
  const normalShare = isFirstPayment ? (cosmetologistFixedShare ?? 0) : 0;

  const options: { value: SplitPreset; label: string }[] = [
    {
      value: "NORMAL",
      label: `Normal — Gise ${currencyFormatter.format(normalShare)}`,
    },
  ];

  // Las etiquetas dicen QUIÉN COBRA y QUIÉN NO en la misma línea: "Todo a
  // Gise" y "Todo a Pili" se parecen demasiado leídas al pasar, y elegir la
  // equivocada mueve el neto entero de una a la otra.
  if (isFirstPayment) {
    options.push({
      value: "TODO_COSMETOLOGA",
      label: "DESVÍO — Gise cobra todo",
    });
  }

  options.push({
    value: "TODO_MEDICA",
    label: "DESVÍO — Pili cobra todo",
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