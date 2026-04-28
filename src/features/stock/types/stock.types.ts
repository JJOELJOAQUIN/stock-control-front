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
};

export type ProductScanResponse = {
  id: string;
  name: string;
  barcode: string;
  scope: ProductScope;
  currentStock: number;
  belowMinimum: boolean;
};

export type PurchaseProductRequest = {
  productId: string;
  quantity: number;
  amount: number;
  context: BusinessContext;
  comment?: string;
};

export type SellByBarcodeRequest = {
  barcode: string;
  quantity: number;
  amount: number;
  paymentMethod: PaymentMethod;
  context: BusinessContext;
  comment?: string;
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