import type { CashActor } from "@/features/caja/types/cash.types";

export type BusinessContext = "LOCAL" | "CONSULTORIO";

export type ProductScope = "LOCAL" | "CONSULTORIO" | "BOTH";

export type PaymentMethod = "CASH" | "TRANSFER" | "DEBIT" | "CREDIT";

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  minimumStock: number;
  active: boolean;
  category: string;
  brand: string;
  expirable: boolean;
  barcode?: string | null;
  scope: ProductScope;
  costPrice?: number | null;
  salePrice?: number | null;
  defaultMarkupPercentage?: number | null;
  /** Vida útil estimada en meses (magistrales). Null = sin estimación. */
  shelfLifeMonths?: number | null;
  /** Prioridad de reposición: 0 normal, 1 alta, 2 crítica. */
  restockPriority?: number | null;
};

export type CreateProductRequest = {
  name: string;
  description?: string;
  minimumStock: number;
  category: string;
  brand: string;
  expirable?: boolean;
  scope: ProductScope;
  barcode?: string;
  costPrice: number;
  salePrice?: number | null;
  defaultMarkupPercentage?: number | null;
  shelfLifeMonths?: number | null;
  restockPriority?: number | null;
};

export type ProductScanResponse = {
  id: string;
  name: string;
  barcode: string;
  scope: ProductScope;
  currentStock: number;
  belowMinimum: boolean;
  costPrice?: number | null;
  salePrice?: number | null;
  defaultMarkupPercentage?: number | null;
};

export type PurchaseItem = {
  productId: string;
  quantity: number;
  unitCost: number;
  expirationDate?: string | null;
  lotNumber?: string | null;
  updateCostPrice?: boolean;
  updateSalePrice?: boolean;
  newSalePrice?: number | null;
  updateMarkupPercentage?: boolean;
  newDefaultMarkupPercentage?: number | null;
};

export type PurchaseOrderRequest = {
  context: BusinessContext;
  comment?: string;
  paymentMethod: PaymentMethod;
  expectedTotal: number;
  items: PurchaseItem[];
};

export type SellByBarcodeRequest = {
  barcode: string;
  quantity: number;
  amount: number;
  paymentMethod: PaymentMethod;
  context: BusinessContext;
  comment?: string;
  performedBy: CashActor;
};

export type ProductWithStock = {
  id: string;
  name: string;
  barcode?: string | null;
  brand: string;
  category: string;
  scope: "LOCAL" | "CONSULTORIO" | "BOTH";
  minimumStock: number;
  currentStock: number;
  belowMinimum: boolean;
  active: boolean;
  costPrice?: number | null;
  salePrice?: number | null;
  defaultMarkupPercentage?: number | null;
  shelfLifeMonths?: number | null;
  restockPriority?: number | null;
};

export type UpdateProductRequest = {
  name: string;
  description?: string;
  minimumStock: number;
  category: string;
  brand: string;
  expirable?: boolean;
  active?: boolean;
  costPrice: number;
  salePrice?: number | null;
  defaultMarkupPercentage?: number | null;
  shelfLifeMonths?: number | null;
  restockPriority?: number | null;
};

export type PatchProductRequest = {
  name?: string;
  description?: string;
  minimumStock?: number;
  category?: string;
  brand?: string;
  expirable?: boolean;
  active?: boolean;
  shelfLifeMonths?: number | null;
  restockPriority?: number | null;
};

export type ProductBatchExpiration = {
  batchId: string;
  productId: string;
  expirationDate: string;
  quantityCurrent: number;
  productName: string;
  barcode?: string | null;
  lotNumber?: string | null;
  daysToExpire: number;
  context: "LOCAL" | "CONSULTORIO";
  /** true = vencimiento estimado desde la fecha de ingreso; false = real. */
  estimated: boolean;
};

/* ------------------------------------------------------------------ */
/* Consumo interno (uso personal, carrito/camilla, muestras, etc.)     */
/* ------------------------------------------------------------------ */

/**
 * Motivos de consumo interno. Debe mantenerse en sincronía con el enum
 * StockMovementReason del backend (solo el subconjunto habilitado para
 * consumo interno en BusinessOperationService.INTERNAL_CONSUMPTION_REASONS).
 */
export const INTERNAL_CONSUMPTION_REASONS = [
  { value: "USO_PERSONAL", label: "Uso personal" },
  { value: "USO_CAMILLA", label: "Uso en camilla" },
  { value: "TRASLADO", label: "Traslado a carrito" },
  { value: "MUESTRA", label: "Muestra" },
  { value: "REGALO", label: "Regalo" },
  { value: "PEDIDO_ESPECIAL", label: "Pedido especial (sin cobro)" },
  { value: "VENCIMIENTO", label: "Baja por vencimiento" },
  { value: "OTRO", label: "Otro" },
] as const;

export type InternalConsumptionReason =
  (typeof INTERNAL_CONSUMPTION_REASONS)[number]["value"];

export type InternalConsumptionRequest = {
  productId: string;
  quantity: number;
  context: BusinessContext;
  reason: InternalConsumptionReason;
  comment?: string;
};

/* ------------------------------------------------------------------ */
/* Prioridad de reposición                                             */
/* ------------------------------------------------------------------ */

export const RESTOCK_PRIORITIES = [
  { value: 0, label: "Normal" },
  { value: 1, label: "Alta" },
  { value: 2, label: "Crítica" },
] as const;

export function restockPriorityLabel(priority: number | null | undefined): string {
  return (
    RESTOCK_PRIORITIES.find((p) => p.value === (priority ?? 0))?.label ?? "Normal"
  );
}

/**
 * Marcas de producto disponibles. Debe mantenerse en sincronía con el enum
 * ProductBrand del backend (com.jowi.stock.product.enums.ProductBrand).
 * Fuente única: importar desde acá en todos los componentes que listen marcas.
 */
export const PRODUCT_BRANDS = [
  "LIDHERMA",
  "IDRAET",
  "EXEL",
  "BIOBELLUS",
  "OXAPHARMA",
  "MESOESTETIC",
  "GENERICO",
  "PRODERMIC",
  "HDM",
  "LACA",
  "CARTHAGE",
  "FORTBENTON",
  "BIOFARMACY",
  "LACROZE",
  "VIP",
  "MAURE",
  "DERMASSI",
  "U_DERM",
  "BEAUTY_NOW",
  "MIRADROR",
  "UVANZA",
  "EXODERMAL",
] as const;

export type ProductBrand = (typeof PRODUCT_BRANDS)[number];