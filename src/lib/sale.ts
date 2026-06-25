import type { CashActor, PaymentMethod } from "@/features/caja/types/cash.types";
import type { ProductScanResponse } from "@/features/stock/types/stock.types";


export const CASH_DISCOUNT_PERCENT = 10;

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

export const SALE_ACTORS: { value: CashActor; label: string }[] = [
  { value: "COSMETOLOGA", label: "Cosmetóloga" },
  { value: "MEDICA", label: "Médica" },
];

// Única fuente de cálculo de venta. Acepta cantidad como string o number.
export function calcSale(
  product: ProductScanResponse | null,
  quantityRaw: string | number,
  paymentMethod: PaymentMethod
) {
  const qty = Number(quantityRaw);
  const unitPrice = Number(product?.salePrice ?? 0);
  const validQty = Number.isFinite(qty) && qty > 0 ? qty : 0;
  const subtotal = unitPrice > 0 ? validQty * unitPrice : 0;
  const discountPercent = paymentMethod === "CASH" ? CASH_DISCOUNT_PERCENT : 0;
  const discountAmount = subtotal * (discountPercent / 100);

  return {
    qty: validQty,
    unitPrice,
    subtotal,
    discountPercent,
    discountAmount,
    total: subtotal - discountAmount,
  };
}