import { useState } from "react";
import { toast } from "sonner";

import { StockOperationsPanel } from "@/features/stock/components/StockOperationPanel";
import { PurchaseDialog } from "@/features/stock/components/PurchaseDialog";
import { SellDialog } from "@/features/stock/components/SellDialog";
import { InternalConsumptionDialog } from "@/features/caja/ui/components/InternalConsumptionDialog";
import { useStockPage } from "@/features/stock/hooks/useStockPage";
import { useHasRole } from "@/features/auth/hooks/useRoles";
import type {
  InternalConsumptionRequest,
  PaymentMethod,
  ProductWithStock,
  PurchaseOrderRequest,
} from "@/features/stock/types/stock.types";

/**
 * Escaneo como seccion propia: el panel de operaciones rapidas de siempre,
 * sin la venta multi-item (que se mudo a Caja como "Precio especial") —
 * el boton sigue existiendo en el panel pero aca redirige alla via la
 * navegacion; esta pagina mantiene compra, venta simple y consumo.
 */
export default function StockEscanearPage() {
  const {
    context,
    filteredProducts,
    barcodeQuery,
    setBarcodeQuery,
    scannedProduct,
    isScanning,
    isPurchasing,
    isSelling,
    isConsuming,
    handleScan,
    handlePurchase,
    handleSell,
    handleConsume,
    performer,
    products,
  } = useStockPage();

  const canRegisterPurchase = useHasRole(["ADMIN", "USER"]);
  const canManageProducts = useHasRole(["ADMIN"]);

  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [consumeProduct, setConsumeProduct] = useState<ProductWithStock | null>(null);

  const [sellForm, setSellForm] = useState({
    quantity: "",
    amount: "",
    paymentMethod: "CASH" as PaymentMethod,
    comment: "",
    performedBy: performer.actor,
  });

  const openPurchaseDialog = (product?: ProductWithStock) => {
    setSelectedProduct(product ?? null);
    setIsPurchaseOpen(true);
  };

  const onSubmitPurchase = async (order: Omit<PurchaseOrderRequest, "context">) => {
    try {
      await handlePurchase(order);
      setIsPurchaseOpen(false);
      setSelectedProduct(null);
    } catch {
      // toast en el hook
    }
  };

  const onSubmitSell = async () => {
    // handleSell espera barcode + numeros; el form guarda strings y el
    // barcode vive en el producto escaneado, igual que en stock.tsx.
    if (!scannedProduct?.barcode) {
      toast.error("No hay producto escaneado");
      return;
    }

    const quantity = Number(sellForm.quantity);
    const amount = Number(sellForm.amount);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    try {
      await handleSell({
        barcode: scannedProduct.barcode,
        quantity,
        amount,
        paymentMethod: sellForm.paymentMethod,
        comment: sellForm.comment,
        performedBy: sellForm.performedBy,
      });
      setIsSellOpen(false);
    } catch {
      // toast en el hook
    }
  };

  const onSubmitConsume = async (
    payload: Omit<InternalConsumptionRequest, "context">
  ) => {
    try {
      await handleConsume(payload);
      setConsumeProduct(null);
    } catch {
      // toast en el hook
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Escanear productos
        </h1>
        <p className="text-sm text-muted-foreground">
          Busca por codigo de barras y opera sobre el producto.
        </p>
      </div>

      <StockOperationsPanel
        context={context}
        barcodeQuery={barcodeQuery}
        setBarcodeQuery={setBarcodeQuery}
        scannedProduct={scannedProduct}
        isScanning={isScanning}
        onScan={handleScan}
        onOpenSell={() => setIsSellOpen(true)}
        canPurchase={canRegisterPurchase}
        canManageProducts={canManageProducts}
        products={products}
        onOpenMultiSale={() => {
          toast.info("La venta multi-item ahora es Precio especial, en Caja");
        }}
        onOpenConsume={(p: ProductWithStock) => setConsumeProduct(p)}
        onOpenPurchase={openPurchaseDialog}
        onOpenEdit={() => {
          toast.info("Editar productos vive en el catalogo de Stock");
        }}
        onOpenPurchaseFromScan={() => {
          const product = filteredProducts.find(
            (item: ProductWithStock) => item.id === scannedProduct?.id
          );
          if (!product) {
            toast.error("No se encontro el producto en catalogo");
            return;
          }
          openPurchaseDialog(product);
        }}
      />

      <PurchaseDialog
        open={isPurchaseOpen}
        onOpenChange={setIsPurchaseOpen}
        products={filteredProducts}
        initialProduct={selectedProduct}
        isSubmitting={isPurchasing}
        onSubmit={onSubmitPurchase}
      />

      <SellDialog
        open={isSellOpen}
        onOpenChange={setIsSellOpen}
        barcode={scannedProduct?.barcode ?? ""}
        form={sellForm}
        setForm={setSellForm}
        isSubmitting={isSelling}
        onSubmit={onSubmitSell}
        product={scannedProduct}
      />

      <InternalConsumptionDialog
        open={!!consumeProduct}
        onOpenChange={(o) => !o && setConsumeProduct(null)}
        product={consumeProduct}
        isSubmitting={isConsuming}
        onSubmit={onSubmitConsume}
      />
    </div>
  );
}