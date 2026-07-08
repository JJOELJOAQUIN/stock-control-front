import type { CashActor, PaymentMethod } from "./cash.types";

export type CombinedSaleItemKind = "PRODUCT" | "PROCEDURE";

export interface CombinedSaleItemRequest {
  kind: CombinedSaleItemKind;
  productId: string | null;
  procedureCode: string | null;
  description: string;
  quantity: number;
  unitAmount: number;
  subtotal: number;
  performedBy: CashActor | null;
  doctorSharePercent: number | null;
  cosmetologistSharePercent: number | null;
}

export interface CombinedSaleRequest {
  context: "LOCAL" | "CONSULTORIO";
  paymentMethod: PaymentMethod;
  comment?: string | null;
  performedBy: CashActor | null;
  expectedTotal: number;
  items: CombinedSaleItemRequest[];
}