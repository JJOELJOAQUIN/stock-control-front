import type { PaymentMethod, CashContext } from "@/features/caja/types/cash.types";

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

export type RegisterPaymentRequest = {
  amount: number;
  paymentMethod: PaymentMethod;
  context: CashContext;
};

export const PEELING_PROFUNDO = {
  code: "PEELING_PROFUNDO_PROTOCOLO",
  label: "PROTOCOLO PEELING PROFUNDO",
} as const;

export const DEFAULT_COSMETOLOGIST_FIXED_SHARE = 40000;