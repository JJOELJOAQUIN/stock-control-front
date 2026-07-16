import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useStockPage } from "../hooks/useStockPage";

import type {
  CreateProductRequest,
  InternalConsumptionRequest,
  PaymentMethod,
  ProductWithStock,
  PurchaseOrderRequest,
  UpdateProductRequest,
} from "../types/stock.types";
import { StockSummary } from "../components/StockSumary";
import { StockOperationsPanel } from "../components/StockOperationPanel";
import { ProductCatalogSection } from "../components/ProductCatalogSection";
import { CreateProductDialog } from "../components/CreateProductDialog";
import { PurchaseDialog } from "../components/PurchaseDialog";
import { SellDialog } from "../components/SellDialog";
import { EditProductDialog } from "../components/EditProductDialog";


import { useHasRole } from "@/features/auth/hooks/useRoles";
import { LowStockCard } from "../components/LowStockCard";
import { InternalConsumptionDialog } from "@/features/caja/ui/components/InternalConsumptionDialog";
import { ProductMultiSaleDialog } from "@/features/caja/ui/components/ProductMultiSaleDialog";

type NewProductForm = CreateProductRequest;

const emptyNewProduct: NewProductForm = {
  name: "",
  description: "",
  minimumStock: 0,
  category: "COSMETICO_VENTA",
  brand: "LIDHERMA",
  expirable: false,
  scope: "CONSULTORIO",
  barcode: "",
  costPrice: 0,
  shelfLifeMonths: null,
  restockPriority: 0,
};

export default function StockPage() {
  const {
    context,
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
    isUpdatingProduct,
    isDeactivatingProduct,
    handleCreateProduct,
    handleScan,
    handlePurchase,
    handleSell,
    handleConsume,
    handleUpdateProduct,
    handleDeactivateProduct,
    refetch,
    products,
  } = useStockPage();

  // Permisos de UI: COSMETOLOGA no ve costos ni registra compras.
  const canViewCosts = useHasRole(["ADMIN", "USER"]);
  const canRegisterPurchase = useHasRole(["ADMIN", "USER"]);
  // Crear / editar / desactivar productos es solo ADMIN (igual que el backend).
  const canManageProducts = useHasRole(["ADMIN"]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConsumeOpen, setIsConsumeOpen] = useState(false);
  const [isMultiSaleOpen, setIsMultiSaleOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductWithStock | null>(null);
  const [consumeProduct, setConsumeProduct] = useState<ProductWithStock | null>(null);
  const [multiSaleInitial, setMultiSaleInitial] = useState<ProductWithStock | null>(null);

  const [newProduct, setNewProduct] = useState<NewProductForm>(emptyNewProduct);

  const [editForm, setEditForm] = useState<UpdateProductRequest>({
    name: "",
    description: "",
    minimumStock: 0,
    category: "COSMETICO_VENTA",
    brand: "LIDHERMA",
    expirable: false,
    active: true,
    costPrice: 0,
    salePrice: 0,
    defaultMarkupPercentage: 0,
    shelfLifeMonths: null,
    restockPriority: 0,
  });

  const [sellForm, setSellForm] = useState({
    quantity: "",
    amount: "",
    paymentMethod: "CASH" as PaymentMethod,
    comment: "",
  });

  const totalProducts = filteredProducts.length;

  const activeProducts = useMemo(
    () => filteredProducts.filter((p) => p.active),
    [filteredProducts]
  );

  const inactiveProducts = useMemo(
    () => filteredProducts.filter((p) => !p.active),
    [filteredProducts]
  );

  const openPurchaseDialog = (product: ProductWithStock) => {
    setSelectedProduct(product);
    setIsPurchaseOpen(true);
  };

  const openSellDialog = () => {
    if (!scannedProduct) {
      toast.error("Primero escaneá un producto");
      return;
    }

    setSellForm({
      quantity: "",
      amount: "",
      paymentMethod: "CASH",
      comment: "",
    });
    setIsSellOpen(true);
  };

  const openConsumeDialog = (product: ProductWithStock) => {
    setConsumeProduct(product);
    setIsConsumeOpen(true);
  };

  const openMultiSaleDialog = (product?: ProductWithStock) => {
    setMultiSaleInitial(product ?? null);
    setIsMultiSaleOpen(true);
  };

  const openEditDialog = (product: ProductWithStock) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: "",
      minimumStock: product.minimumStock,
      category: product.category,
      brand: product.brand,
      expirable: false,
      active: product.active,
      costPrice: Number(product.costPrice ?? 0),
      salePrice: Number(product.salePrice ?? 0),
      defaultMarkupPercentage: Number(product.defaultMarkupPercentage ?? 0),
      shelfLifeMonths: product.shelfLifeMonths ?? null,
      restockPriority: product.restockPriority ?? 0,
    });
    setIsEditOpen(true);
  };

  const onSubmitCreateProduct = async () => {
    try {
      if (!newProduct.name.trim()) {
        toast.error("El nombre es obligatorio");
        return;
      }

      if (newProduct.minimumStock < 0) {
        toast.error("El stock mínimo no puede ser negativo");
        return;
      }

      if (newProduct.costPrice <= 0) {
        toast.error("El costo debe ser mayor a cero");
        return;
      }

      await handleCreateProduct({
        ...newProduct,
        scope: "CONSULTORIO",
        name: newProduct.name.trim(),
        description: newProduct.description?.trim() || "",
        barcode: newProduct.barcode?.trim() || "",
        shelfLifeMonths: newProduct.shelfLifeMonths || null,
        restockPriority: newProduct.restockPriority ?? 0,
      });

      setIsCreateOpen(false);
      setNewProduct({ ...emptyNewProduct, scope: "BOTH" });
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo crear el producto");
    }
  };

  const onSubmitPurchase = async (
    order: Omit<PurchaseOrderRequest, "context">
  ) => {
    try {
      await handlePurchase(order);
      setIsPurchaseOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar la compra");
    }
  };

  const onSubmitSell = async () => {
    try {
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

      await handleSell({
        barcode: scannedProduct.barcode,
        quantity,
        amount,
        paymentMethod: sellForm.paymentMethod,
        comment: sellForm.comment.trim(),
      });

      setIsSellOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar la venta");
    }
  };

  const onSubmitConsume = async (
    payload: Omit<InternalConsumptionRequest, "context">
  ) => {
    try {
      await handleConsume(payload);
      setIsConsumeOpen(false);
      setConsumeProduct(null);
    } catch {
      // El toast de error ya lo muestra el hook.
    }
  };

  const onSubmitEdit = async () => {
    try {
      if (!editingProduct) return;

      if (!editForm.name.trim()) {
        toast.error("El nombre es obligatorio");
        return;
      }

      if (editForm.minimumStock < 0) {
        toast.error("El stock mínimo no puede ser negativo");
        return;
      }

      if (editForm.costPrice <= 0) {
        toast.error("El costo debe ser mayor a cero");
        return;
      }

      await handleUpdateProduct(editingProduct.id, {
        ...editForm,
        name: editForm.name.trim(),
        description: editForm.description?.trim() || "",
        shelfLifeMonths: editForm.shelfLifeMonths || null,
        restockPriority: editForm.restockPriority ?? 0,
      });

      setIsEditOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo actualizar el producto");
    }
  };

  const onDeactivateProduct = async (product: ProductWithStock) => {
    try {
      await handleDeactivateProduct(product.id);
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo desactivar el producto");
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground space-y-6">
      <div className="flex items-start gap-4">
        <Link to="/inicio">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver al inicio</span>
          </Button>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <PackageCheck className="h-5 w-5 text-primary" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Stock
            </h1>
          </div>

          <p className="text-muted-foreground">
            Gestión de productos, existencias y control de inventario
          </p>
        </div>
      </div>

      <StockSummary
        totalProducts={totalProducts}
        activeProducts={activeProducts.length}
        inactiveProducts={inactiveProducts.length}
      />

      <StockOperationsPanel
        context={context}
        barcodeQuery={barcodeQuery}
        setBarcodeQuery={setBarcodeQuery}
        scannedProduct={scannedProduct}
        isScanning={isScanning}
        onScan={handleScan}
        onOpenSell={openSellDialog}
        canPurchase={canRegisterPurchase}
        canManageProducts={canManageProducts}
        products={products}
        onOpenMultiSale={openMultiSaleDialog}
        onOpenConsume={openConsumeDialog}
        onOpenPurchase={openPurchaseDialog}
        onOpenEdit={openEditDialog}
        onOpenPurchaseFromScan={() => {
          const product = filteredProducts.find(
            (item) => item.id === scannedProduct?.id
          );

          if (!product) {
            toast.error("No se encontró el producto en catálogo");
            return;
          }

          openPurchaseDialog(product);
        }}
      />

      <LowStockCard
        products={products}
        onPurchaseProduct={canRegisterPurchase ? openPurchaseDialog : undefined}
      />

      <ProductCatalogSection
        products={filteredProducts}
        isLoading={isLoading}
        search={search}
        setSearch={setSearch}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenPurchase={openPurchaseDialog}
        onOpenEdit={openEditDialog}
        onDeactivate={onDeactivateProduct}
        isDeactivating={isDeactivatingProduct}
        showCost={canViewCosts}
        canPurchase={canRegisterPurchase}
        canManageProducts={canManageProducts}
      />

      <CreateProductDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        form={newProduct}
        setForm={setNewProduct}
        isSubmitting={isCreatingProduct}
        onSubmit={onSubmitCreateProduct}
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

      <ProductMultiSaleDialog
        open={isMultiSaleOpen}
        onOpenChange={setIsMultiSaleOpen}
        context={context}
        products={products}
        initialProduct={multiSaleInitial}
        onSuccess={() => {
          setMultiSaleInitial(null);
          refetch();
        }}
      />

      <InternalConsumptionDialog
        open={isConsumeOpen}
        onOpenChange={setIsConsumeOpen}
        product={consumeProduct}
        isSubmitting={isConsuming}
        onSubmit={onSubmitConsume}
      />

      <EditProductDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        product={editingProduct}
        form={editForm}
        setForm={setEditForm}
        isSubmitting={isUpdatingProduct}
        onSubmit={onSubmitEdit}
      />
    </div>
  );
}