import { useMemo, useState } from "react";
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

import type { ProductScanResponse, PurchaseOrderRequest } from "@/features/stock/types/stock.types";

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

  const scanProduct = async () => {
    if (!barcodeQuery.trim()) {
      toast.error("Ingresá un código de barras");
      return;
    }

    try {
      const product = await triggerScan({
        barcode: barcodeQuery.trim(),
        context: "CONSULTORIO",
      }).unwrap();

      setScannedProduct(product);
    } catch (error: any) {
      setScannedProduct(null);
      toast.error(error?.data?.message || "No se pudo encontrar el producto");
    }
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

      const updatedProduct = await triggerScan({
        barcode: payload.barcode,
        context: "CONSULTORIO",
      }).unwrap();

      setScannedProduct(updatedProduct);
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

      if (scannedProduct?.barcode) {
        const updatedProduct = await triggerScan({
          barcode: scannedProduct.barcode,
          context: "CONSULTORIO",
        }).unwrap();

        setScannedProduct(updatedProduct);
      }
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

    sellProductFromCash,
    purchaseProductFromCash,

    registerProcedureIncome,
    registerExpense,
  };
}