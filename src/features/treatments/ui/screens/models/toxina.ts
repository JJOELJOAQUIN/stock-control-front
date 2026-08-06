import type { CashContext } from "@/features/caja/types/cash.types";

export const TOXINA = {
  code: "TOXINA_XEOMIN",
  label: "Toxina botulínica (Xeomin)",
} as const;

export const DEFAULT_TOXINA_TOTAL = 150000;
export const DEFAULT_UNITS_PER_SESSION = 25;

export type OpenVialStatus = "OPEN" | "DEPLETED" | "EXPIRED";

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