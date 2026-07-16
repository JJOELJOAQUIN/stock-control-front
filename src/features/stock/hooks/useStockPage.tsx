import { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import {
  useCreateProductMutation,
  useDeactivateProductMutation,
  useGetProductsWithStockQuery,
  useInternalConsumptionMutation,
  useLazyScanProductByBarcodeQuery,
  usePurchaseProductMutation,
  useSellByBarcodeMutation,
  useUpdateProductMutation,
} from "../api/stockApi";
import type {
  CreateProductRequest,
  InternalConsumptionRequest,
  PaymentMethod,
  ProductScanResponse,
  PurchaseOrderRequest,
  UpdateProductRequest,
} from "../types/stock.types";
import type { CashActor } from "@/features/caja/types/cash.types";

export function useStockPage() {
  const context: "CONSULTORIO" = "CONSULTORIO";

  const [search, setSearch] = useState("");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [scannedProduct, setScannedProduct] = useState<ProductScanResponse | null>(null);

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useGetProductsWithStockQuery(
    { context },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [updateProduct, { isLoading: isUpdatingProduct }] =
    useUpdateProductMutation();

  const [deactivateProduct, { isLoading: isDeactivatingProduct }] =
    useDeactivateProductMutation();
  const [createProduct, { isLoading: isCreatingProduct }] =
    useCreateProductMutation();

  const [triggerScan, { isFetching: isScanning }] =
    useLazyScanProductByBarcodeQuery();

  const [purchaseProduct, { isLoading: isPurchasing }] =
    usePurchaseProductMutation();

  const [sellByBarcode, { isLoading: isSelling }] = useSellByBarcodeMutation();

  const [internalConsumption, { isLoading: isConsuming }] =
    useInternalConsumptionMutation();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const barcode = (product.barcode ?? "").toLowerCase();
      const brand = product.brand.toLowerCase();
      const category = product.category.toLowerCase();

      return (
        name.includes(q) ||
        barcode.includes(q) ||
        brand.includes(q) ||
        category.includes(q)
      );
    });
  }, [products, search]);

  const runScan = async (
    barcode: string,
    selectedContext: "LOCAL" | "CONSULTORIO"
  ) => {
    const data = await triggerScan({
      barcode: barcode.trim(),
      context: selectedContext,
    }).unwrap();

    setScannedProduct(data);
    return data;
  };

  const handleCreateProduct = async (payload: CreateProductRequest) => {
    await createProduct(payload).unwrap();
    toast.success("Producto creado correctamente");
    refetch();
  };

  const handleScan = async () => {
    if (!barcodeQuery.trim()) {
      toast.error("Ingresá un código de barras");
      return;
    }

    if (!context) {
      toast.error("Seleccioná un contexto");
      return;
    }

    await runScan(barcodeQuery, context);
  };

  const handlePurchase = async (
    order: Omit<PurchaseOrderRequest, "context">
  ) => {
    if (!context) {
      toast.error("Seleccioná un contexto");
      return;
    }

    await purchaseProduct({
      ...order,
      context,
    }).unwrap();

    toast.success("Compra registrada correctamente");
    refetch();

    if (barcodeQuery.trim()) {
      await runScan(barcodeQuery, context);
    }
  };

  const handleSell = async (payload: {
    barcode: string;
    quantity: number;
    amount: number;
    paymentMethod: PaymentMethod;
    comment?: string;
    performedBy?: CashActor;
  }) => {
    if (!context) {
      toast.error("Seleccioná un contexto");
      return;
    }

    await sellByBarcode({
      ...payload,
      context,
      performedBy: payload.performedBy ?? "MEDICA",
    }).unwrap();

    toast.success("Venta registrada correctamente");
    refetch();

    await runScan(payload.barcode, context);
  };

  /**
   * Consumo interno: descuenta stock (y lotes, FEFO) sin generar movimiento
   * de caja ni impactar las métricas de ventas.
   */
  const handleConsume = async (
    payload: Omit<InternalConsumptionRequest, "context">
  ) => {
    if (!context) {
      toast.error("Seleccioná un contexto");
      return;
    }

    try {
      await internalConsumption({ ...payload, context }).unwrap();
      toast.success("Consumo interno registrado");
      refetch();

      if (barcodeQuery.trim()) {
        await runScan(barcodeQuery, context).catch(() => undefined);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar el consumo");
      throw error;
    }
  };

  const handleUpdateProduct = async (id: string, payload: UpdateProductRequest) => {
    await updateProduct({
      id,
      body: payload,
    }).unwrap();

    toast.success("Producto actualizado correctamente");
    refetch();
  };

  const handleDeactivateProduct = async (id: string) => {
    await deactivateProduct(id).unwrap();
    toast.success("Producto desactivado correctamente");
    refetch();
  };

  useEffect(() => {
    if (!context) {
      setScannedProduct(null);
      return;
    }

    if (!barcodeQuery.trim()) {
      setScannedProduct(null);
      return;
    }

    runScan(barcodeQuery, context).catch(() => {
      setScannedProduct(null);
    });
  }, [context]);

  return {
    context,
    products,
    filteredProducts,
    isLoading,
    search,
    setSearch,
    barcodeQuery,
    setBarcodeQuery,
    scannedProduct,
    isScanning,
    isCreatingProduct,
    isPurchasing,
    isSelling,
    isConsuming,
    handleCreateProduct,
    handleScan,
    handlePurchase,
    handleSell,
    handleConsume,
    isUpdatingProduct,
    isDeactivatingProduct,
    handleUpdateProduct,
    handleDeactivateProduct,
    refetch,
  };
}