// features/treatments/models/treatment.ts
import type { PaymentMethod, CashContext } from "@/features/caja/types/cash.types";

export type TreatmentStatus =
  | "PENDIENTE"
  | "PARCIALMENTE_PAGADO"
  | "PAGADO";

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  dni?: string | null;
  email?: string | null;
  observations?: string | null;
  active?: boolean;
  createdAt?: string;
};

export type CreatePatientRequest = {
  firstName: string;
  lastName: string;
  phone?: string;
  dni?: string;
  email?: string;
  observations?: string;
};

export type TreatmentPayment = {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  cashMovementId?: string | null;
  doctorShare?: number | null;
  cosmetologistShare?: number | null;
  comment?: string | null;
  createdAt: string;
};

export type Treatment = {
  id: string;
  procedureCode: string;
  procedureLabel?: string | null;
  patient?: Patient | null;
  context: CashContext;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: TreatmentStatus;
  cosmetologistFixedShare?: number | null;
  comment?: string | null;
  payments: TreatmentPayment[];
  createdAt: string;
};

export type CreateTreatmentRequest = {
  procedureCode: string;
  procedureLabel?: string;
  patientId?: string;
  context: CashContext;
  totalAmount: number;
  cosmetologistFixedShare?: number | null;
  comment?: string;
  firstPaymentAmount?: number | null;
  firstPaymentMethod?: PaymentMethod | null;
};

export type RegisterPaymentRequest = {
  amount: number;
  paymentMethod: PaymentMethod;
  comment?: string;
};

// Peeling profundo: procedimiento con paciente obligatorio y reparto fijo.
export const PEELING_PROFUNDO = {
  code: "PEELING_PROFUNDO_PROTOCOLO",
  label: "PROTOCOLO PEELING PROFUNDO",
} as const;

export const DEFAULT_COSMETOLOGIST_FIXED_SHARE = 40000;