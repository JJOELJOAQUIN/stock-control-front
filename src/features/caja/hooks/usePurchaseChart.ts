import { useCallback, useMemo, useState } from "react";

import type { ProductWithStock } from "@/features/stock/types/stock.types";
import { calcOrderTotal, type PurchaseCartLine } from "@/shared/lib/purchase";

const createLineId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type CartLinePatch = Partial<
  Pick<PurchaseCartLine, "quantity" | "unitCost" | "lotNumber" | "expirationDate">
>;

export function buildCartLine(product: ProductWithStock): PurchaseCartLine {
  const savedCost =
    product.costPrice != null && product.costPrice > 0 ? product.costPrice : 0;

  return {
    lineId: createLineId(),
    productId: product.id,
    productName: product.name,
    quantity: 1,
    unitCost: savedCost,
    lotNumber: "",
    expirationDate: "",
    // Campos legacy: el submit usa el toggle global. Se dejan por compat de tipo.
    updateCostPrice: false,
    updateSalePrice: false,
    newSalePrice: "",
  };
}

export function usePurchaseCart() {
  const [lines, setLines] = useState<PurchaseCartLine[]>([]);

  const addProduct = useCallback((product: ProductWithStock) => {
    setLines((prev) =>
      prev.some((l) => l.productId === product.id)
        ? prev
        : [...prev, buildCartLine(product)]
    );
  }, []);

  const updateLine = useCallback((lineId: string, patch: CartLinePatch) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, ...patch } : l))
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const reset = useCallback(
    (initial: PurchaseCartLine[] = []) => setLines(initial),
    []
  );

  const total = useMemo(() => calcOrderTotal(lines), [lines]);
  const addedProductIds = useMemo(
    () => new Set(lines.map((l) => l.productId)),
    [lines]
  );

  return { lines, addProduct, updateLine, removeLine, reset, total, addedProductIds };
}