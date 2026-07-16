/**
 * Lógica compartida para el flujo de compra de productos.
 *
 * Son funciones puras (sin estado ni efectos): los componentes mantienen su
 * propio estado y delegan aquí el cálculo y la validación de la compra.
 */

export const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

/**
 * Monto total de la compra a partir del costo unitario y la cantidad.
 * Se redondea a 2 decimales para coincidir con el cálculo del backend
 * (que recalcula el costo unitario con HALF_UP a 2 decimales).
 */
export function calcTotalAmount(unitCost: number, quantity: number): number {
  if (!Number.isFinite(unitCost) || !Number.isFinite(quantity)) return 0;
  if (unitCost <= 0 || quantity <= 0) return 0;
  return Number((unitCost * quantity).toFixed(2));
}

/**
 * Precio de venta sugerido aplicando el margen por defecto del producto
 * sobre el costo unitario ingresado. Devuelve 0 si no hay datos suficientes.
 */
export function calcSuggestedSalePrice(
  unitCost: number,
  markupPercentage: number | null | undefined
): number {
  if (!Number.isFinite(unitCost) || unitCost <= 0) return 0;
  if (markupPercentage == null) return 0;
  return unitCost + unitCost * (markupPercentage / 100);
}

export type PurchaseValidationInput = {
  quantity: number;
  unitCost: number;
  updateSalePrice: boolean;
  newSalePrice: number;
};

/**
 * Valida los datos de una compra. Devuelve el mensaje de error a mostrar,
 * o null si la compra es válida.
 */
export function validatePurchase(input: PurchaseValidationInput): string | null {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return "La cantidad debe ser mayor a cero";
  }

  if (!Number.isFinite(input.unitCost) || input.unitCost <= 0) {
    return "El costo unitario debe ser mayor a cero";
  }

  if (input.updateSalePrice) {
    if (!Number.isFinite(input.newSalePrice) || input.newSalePrice <= 0) {
      return "El nuevo precio de venta debe ser mayor a cero";
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Carrito de compra multi-ítem                                        */
/* ------------------------------------------------------------------ */

/**
 * Línea del carrito de compra. Mantiene los datos editables del ítem más
 * una referencia a los datos del producto para mostrarlos en la UI.
 */
export type PurchaseCartLine = {
  /** id local de la línea (no es el productId), para keys de React y edición */
  lineId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  lotNumber: string;
  expirationDate: string;
  /**
   * Vida útil estimada del producto en meses (magistrales). Si está definida
   * y no se carga vencimiento manual, el backend calcula el vencimiento
   * estimado desde la fecha de ingreso. Solo informativo en la UI.
   */
  shelfLifeMonths: number | null;
  updateCostPrice: boolean;
  updateSalePrice: boolean;
  newSalePrice: string;
};

/** Subtotal de una línea del carrito. */
export function calcLineSubtotal(line: Pick<PurchaseCartLine, "unitCost" | "quantity">): number {
  return calcTotalAmount(line.unitCost, line.quantity);
}

/** Total de la orden: suma de subtotales de todas las líneas, a 2 decimales. */
export function calcOrderTotal(lines: PurchaseCartLine[]): number {
  const total = lines.reduce((acc, line) => acc + calcLineSubtotal(line), 0);
  return Number(total.toFixed(2));
}

/**
 * Valida el carrito completo. Devuelve el mensaje de error a mostrar, o null
 * si toda la orden es válida.
 */
export function validatePurchaseOrder(lines: PurchaseCartLine[]): string | null {
  if (lines.length === 0) {
    return "Agregá al menos un producto a la compra";
  }

  for (const line of lines) {
    const error = validatePurchase({
      quantity: line.quantity,
      unitCost: line.unitCost,
      updateSalePrice: line.updateSalePrice,
      newSalePrice: Number(line.newSalePrice),
    });

    if (error) {
      return `${line.productName}: ${error}`;
    }
  }

  return null;
}