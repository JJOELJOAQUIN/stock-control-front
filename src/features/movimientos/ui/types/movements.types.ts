export type StockMovementType = "IN" | "OUT" | "ADJUST";

export type StockMovementReason =
  | "COMPRA_PROVEEDOR"
  | "VENTA"
  | "AJUSTE_ERROR";

export type BusinessContext = "LOCAL" | "CONSULTORIO";

export type StockMovementItem = {
  id: string;
  productId: string;
  productName?: string;
  type: StockMovementType;
  reasonType: StockMovementReason;
  quantity: number;
  comment?: string | null;
  context: BusinessContext;
  createdAt: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type MovementsQueryParams = {
  productId: string;
  context: BusinessContext;
  type?: StockMovementType;
  reason?: StockMovementReason;
  minQty?: number;
  maxQty?: number;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};