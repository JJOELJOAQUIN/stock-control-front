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
  salePrice?: number | null
  defaultMarkupPercentage?: number | null
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
  salePrice?: number | null
  defaultMarkupPercentage?: number | null
};

export type ProductScanResponse = {
  id: string;
  name: string;
  barcode: string;
  scope: ProductScope;
  currentStock: number;
  belowMinimum: boolean;
  costPrice?: number | null
  salePrice?: number | null
  defaultMarkupPercentage?: number | null
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
};

export type PatchProductRequest = {
  name?: string;
  description?: string;
  minimumStock?: number;
  category?: string;
  brand?: string;
  expirable?: boolean;
  active?: boolean;
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