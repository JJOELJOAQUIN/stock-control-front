import { useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useBusinessContext } from "@/core/context/business-context";
import { useGetProductsWithStockQuery } from "@/features/stock/api/stockApi";
import { useGetStockMovementsQuery } from "../api/movementsApi";
import type { StockMovementReason, StockMovementType } from "../ui/types/movements.types";


export function useMovementsPage() {
  const { context } = useBusinessContext();

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [type, setType] = useState<StockMovementType | "ALL">("ALL");
  const [reason, setReason] = useState<StockMovementReason | "ALL">("ALL");
  const [minQty, setMinQty] = useState<string>("");
  const [maxQty, setMaxQty] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(0);
  const size = 10;

  const { data: products = [] } = useGetProductsWithStockQuery(
    context ? { context } : skipToken
  );

  const canQuery = Boolean(context && selectedProductId);

  const queryArgs = canQuery
    ? {
        productId: selectedProductId,
        context: context!,
        type: type !== "ALL" ? type : undefined,
        reason: reason !== "ALL" ? reason : undefined,
        minQty: minQty ? Number(minQty) : undefined,
        maxQty: maxQty ? Number(maxQty) : undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        size,
      }
    : skipToken;

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetStockMovementsQuery(queryArgs);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const resetFilters = () => {
    setType("ALL");
    setReason("ALL");
    setMinQty("");
    setMaxQty("");
    setFrom("");
    setTo("");
    setPage(0);
  };

  return {
    context,
    products,
    selectedProduct,
    selectedProductId,
    setSelectedProductId,
    type,
    setType,
    reason,
    setReason,
    minQty,
    setMinQty,
    maxQty,
    setMaxQty,
    from,
    setFrom,
    to,
    setTo,
    page,
    setPage,
    size,
    data,
    isLoading,
    isFetching,
    refetch,
    canQuery,
    resetFilters,
  };
}