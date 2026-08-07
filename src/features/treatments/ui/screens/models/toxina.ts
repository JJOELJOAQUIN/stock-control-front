import type { CashContext, PaymentMethod } from "@/features/caja/types/cash.types";

export const TOXINA = {
  code: "TOXINA_XEOMIN",
  label: "Toxina botulínica (Xeomin)",
} as const;

export const DEFAULT_TOXINA_TOTAL = 150000;
export const DEFAULT_UNITS_PER_SESSION = 25;

export type OpenVialStatus = "OPEN" | "DEPLETED" | "EXPIRED";
export type ToxinaTreatmentStatus = "PENDIENTE" | "PARCIAL" | "COMPLETO";

export type ToxinaSession = {
  id: string;
  treatmentId: string;
  openVialId: string;
  sessionNumber: number;
  performedAt: string;
  unitsUsed: number;
  vialUnitsRemaining: number;
  vialExpiresAt: string;
  vialStatus: OpenVialStatus;
};

/** Lo que devuelve GET /api/toxina/treatments (tratamiento + sesiones). */
export type ToxinaTreatment = {
  id: string;
  patientId: string;
  patientName: string;
  totalAmount: number;
  paidAmount: number;
  status: ToxinaTreatmentStatus;
  sessions: ToxinaSession[];
};

export type CreateToxinaTreatmentRequest = {
  patientId: string;
  totalAmount: number;
  description?: string;
};

export type RegisterToxinaSessionRequest = {
  productId: string;
  sessionNumber: number;
  unitsUsed: number;
  context?: CashContext;
};

/** Coincide con AlertResponse del backend (GET /api/alerts/open-vials). */
export type OpenVialAlert = {
  type: string;
  productId: string;
  productName: string;
  message: string;
  createdAt: string;
};

// ---- Inputs de la UI (todo en un modal) ----

export type RegisterToxinaInput = {
  patientId: string;
  totalAmount: number;
  firstSessionUnits: number;
  paymentAmount: number | null;
  paymentMethod: PaymentMethod | null;
};

export type RegisterSecondSessionInput = {
  treatmentId: string;
  units: number;
  paymentAmount: number | null;
  paymentMethod: PaymentMethod | null;
};

/** Si al tratamiento ya se le registró el pago único. */
export function isPaid(t: ToxinaTreatment): boolean {
  return t.paidAmount >= t.totalAmount && t.totalAmount > 0;
}

export function sessionByNumber(t: ToxinaTreatment, n: number): ToxinaSession | undefined {
  return t.sessions.find((s) => s.sessionNumber === n);
}