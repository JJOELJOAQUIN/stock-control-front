import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useCreateCashMovementMutation,
  useGetCashMovementsQuery,
  useGetDailyCashSplitQuery,
  useGetSalesTotalsQuery,
} from "../api/cashApi";

import type {
  PaymentMethod,
  ProcedureOption,
  CashActor,
} from "../types/cash.types";

import {
  useGetExpiringProductBatchesQuery,
  useGetProductsWithStockQuery,
  useLazyScanProductByBarcodeQuery,
  usePurchaseProductMutation,
  useSellByBarcodeMutation,
} from "@/features/stock/api/stockApi";

import type {
  ProductScanResponse,
  ProductWithStock,
  PurchaseOrderRequest,
} from "@/features/stock/types/stock.types";

function getTodayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function useCashConsultorioPage() {
  const [page, setPage] = useState(0);
  const [splitDate, setSplitDate] = useState(getTodayISODate());

  const size = 10;

  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [scannedProduct, setScannedProduct] =
    useState<ProductScanResponse | null>(null);
  const [nameResults, setNameResults] = useState<ProductScanResponse[]>([]);

  const {
    data,
    isLoading,
    refetch: refetchCash,
  } = useGetCashMovementsQuery({
    context: "CONSULTORIO",
    page,
    size,
  });

  const {
    data: dailySplit,
    isLoading: isLoadingDailySplit,
    refetch: refetchDailySplit,
  } = useGetDailyCashSplitQuery({
    context: "CONSULTORIO",
    date: splitDate,
  });

  const {
    data: products = [],
    refetch: refetchProducts,
  } = useGetProductsWithStockQuery({
    context: "CONSULTORIO",
  });

  const {
    data: expiringProducts = [],
    isLoading: isLoadingExpiringProducts,
    refetch: refetchExpiringProducts,
  } = useGetExpiringProductBatchesQuery({
    context: "CONSULTORIO",
    days: 120,
  });

  const { data: salesTotals } = useGetSalesTotalsQuery({
    context: "CONSULTORIO",
  });

  const [createCashMovement, { isLoading: isCreating }] =
    useCreateCashMovementMutation();

  const [triggerScan, { isFetching: isScanning }] =
    useLazyScanProductByBarcodeQuery();

  const [sellByBarcode, { isLoading: isSellingProduct }] =
    useSellByBarcodeMutation();

  const [purchaseProduct, { isLoading: isPurchasingProduct }] =
    usePurchaseProductMutation();

  const items = data?.content ?? [];

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const amount = Number(item.amount ?? 0);
        const net = Number(item.netAmount ?? 0);

        if (item.type === "IN") {
          acc.income += amount;
          acc.netIncome += net;
        } else {
          acc.expense += amount;
          acc.netExpense += net;
        }

        return acc;
      },
      {
        income: 0,
        expense: 0,
        netIncome: 0,
        netExpense: 0,
      }
    );
  }, [items]);

  // Valor del stock (productos del contexto CONSULTORIO), a costo y a venta.
  const stockValue = useMemo(() => {
    return products.reduce(
      (acc, p) => {
        const qty = Number(p.currentStock ?? 0);
        acc.atCost += qty * Number(p.costPrice ?? 0);
        acc.atSale += qty * Number(p.salePrice ?? 0);
        return acc;
      },
      { atCost: 0, atSale: 0 }
    );
  }, [products]);

  const refetchCaja = async () => {
    await refetchCash();
    await refetchDailySplit();
  };

  // Limpia el producto escaneado/seleccionado, el query y los resultados.
  // Se usa al cerrar el modal de venta para que no quede "pegado".
  const clearScannedProduct = useCallback(() => {
    setScannedProduct(null);
    setNameResults([]);
    setBarcodeQuery("");
  }, []);

  // Mapea un producto de la lista (ProductWithStock) al formato que usa
  // la tarjeta de venta (ProductScanResponse).
  const toScanResponse = (p: ProductWithStock): ProductScanResponse => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode ?? "",
    scope: p.scope as ProductScanResponse["scope"],
    currentStock: p.currentStock,
    belowMinimum: p.belowMinimum,
    costPrice: p.costPrice ?? null,
    salePrice: p.salePrice ?? null,
    defaultMarkupPercentage: p.defaultMarkupPercentage ?? null,
  });

  const scanProduct = async () => {
    const term = barcodeQuery.trim();

    if (!term) {
      toast.error("Ingresá un código o nombre de producto");
      return;
    }

    const isNumeric = /^\d+$/.test(term);

    // Texto -> búsqueda por nombre en memoria, muestra lista de resultados.
    if (!isNumeric) {
      const matches = products
        .filter((p) => p.barcode) // solo vendibles por barcode
        .filter((p) => p.name.toLowerCase().includes(term.toLowerCase()))
        .map(toScanResponse);

      setNameResults(matches);
      setScannedProduct(null);

      if (matches.length === 0) {
        toast.error("No se encontraron productos con ese nombre");
      }
      return;
    }

    // Numérico -> scan por barcode exacto (comportamiento original).
    try {
      const product = await triggerScan({
        barcode: term,
        context: "CONSULTORIO",
      }).unwrap();

      setNameResults([]);
      setScannedProduct(product);
    } catch (error: any) {
      setScannedProduct(null);
      toast.error(error?.data?.message || "No se pudo encontrar el producto");
    }
  };

  // Selecciona un producto de los resultados de búsqueda por nombre.
  const selectProductByName = (product: ProductScanResponse) => {
    setScannedProduct(product);
    setNameResults([]);
  };

  const sellProductFromCash = async (payload: {
    barcode: string;
    quantity: number;
    amount: number;
    paymentMethod: PaymentMethod;
    comment?: string;
    performedBy: CashActor;
  }) => {
    try {
      await sellByBarcode({
        barcode: payload.barcode,
        quantity: payload.quantity,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod,
        context: "CONSULTORIO",
        comment: payload.comment,
        performedBy: payload.performedBy,
      }).unwrap();

      toast.success("Venta de producto registrada");

      await refetchCaja();
      await refetchProducts();
      await refetchExpiringProducts();

      // Antes se re-escaneaba y se volvía a setear scannedProduct, lo que
      // reabría el modal. Ahora limpiamos para que el modal se cierre.
      clearScannedProduct();
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar la venta");
    }
  };

const purchaseProductFromCash = async (
  order: Omit<PurchaseOrderRequest, "context">
) => {
  try {
    await purchaseProduct({
      ...order,
      context: "CONSULTORIO",
    }).unwrap();

    toast.success("Compra de producto registrada");

    await refetchCaja();
    await refetchProducts();
    await refetchExpiringProducts();

    clearScannedProduct();
  } catch (error: any) {
    toast.error(error?.data?.message || "No se pudo registrar la compra");
  }
};

  const registerProcedureIncome = async (payload: {
    procedure: ProcedureOption;
    amount: number;
    paymentMethod: PaymentMethod;
    comment?: string;
    doctorSharePercent: number;
    cosmetologistSharePercent: number;
  }) => {
    try {
      await createCashMovement({
        type: "IN",
        source: "PROCEDURE",
        paymentMethod: payload.paymentMethod,
        context: "CONSULTORIO",
        amount: payload.amount,
        retentionPercent: null,
        comment:
          payload.comment?.trim() ||
          `Procedimiento: ${payload.procedure.label}`,
        referenceId: null,
        doctorSharePercent: payload.doctorSharePercent,
        cosmetologistSharePercent: payload.cosmetologistSharePercent,
      }).unwrap();

      toast.success("Ingreso por procedimiento registrado");
      await refetchCaja();
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar el ingreso");
    }
  };

  const registerExpense = async (payload: {
    amount: number;
    paymentMethod: PaymentMethod;
    comment?: string;
  }) => {
    try {
      await createCashMovement({
        type: "OUT",
        source: "EXPENSE",
        paymentMethod: payload.paymentMethod,
        context: "CONSULTORIO",
        amount: payload.amount,
        retentionPercent: null,
        comment: payload.comment?.trim() || "Egreso manual consultorio",
        referenceId: null,
        doctorSharePercent: null,
        cosmetologistSharePercent: null,
      }).unwrap();

      toast.success("Egreso registrado");
      await refetchCaja();
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar el egreso");
    }
  };

  return {
    data,
    items,

    page,
    setPage,
    size,

    splitDate,
    setSplitDate,
    dailySplit,
    isLoadingDailySplit,

    products,

    expiringProducts,
    isLoadingExpiringProducts,

    isLoading,
    isCreating,
    isScanning,
    isSellingProduct,
    isPurchasingProduct,

    summary,
    salesTotals,
    stockValue,

    barcodeQuery,
    setBarcodeQuery,
    scannedProduct,
    scanProduct,
    nameResults,
    selectProductByName,
    clearScannedProduct,

    sellProductFromCash,
    purchaseProductFromCash,

    registerProcedureIncome,
    registerExpense,
  };
}