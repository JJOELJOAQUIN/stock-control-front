import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useStockPage } from "../hooks/useStockPage";
import type {
  CreateProductRequest,
  PaymentMethod,
  ProductWithStock,
  UpdateProductRequest,
} from "../types/stock.types";
import { StockSummary } from "../components/StockSumary";
import { StockOperationsPanel } from "../components/StockOperationPanel";
import { ProductCatalogSection } from "../components/ProductCatalogSection";
import { CreateProductDialog } from "../components/CreateProductDialog";
import { PurchaseDialog } from "../components/PurchaseDialog";
import { SellDialog } from "../components/SellDialog";
import { EditProductDialog } from "../components/EditProductDialog";

type NewProductForm = CreateProductRequest;

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
    isUpdatingProduct,
    isDeactivatingProduct,
    handleCreateProduct,
    handleScan,
    handlePurchase,
    handleSell,
    handleUpdateProduct,
    handleDeactivateProduct,
  } = useStockPage();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductWithStock | null>(null);

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: "",
    description: "",
    minimumStock: 0,
    category: "COSMETICO_VENTA",
    brand: "LIDHERMA",
    expirable: false,
    scope: "BOTH",
    barcode: "",
    costPrice: 0,
  });

  const [editForm, setEditForm] = useState<UpdateProductRequest>({
    name: "",
    description: "",
    minimumStock: 0,
    category: "COSMETICO_VENTA",
    brand: "LIDHERMA",
    expirable: false,
    active: true,
    costPrice: 0,
  });

  const [purchaseForm, setPurchaseForm] = useState({
    quantity: "",
    amount: "",
    comment: "",
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
    setPurchaseForm({
      quantity: "",
      amount: "",
      comment: "",
    });
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
        name: newProduct.name.trim(),
        description: newProduct.description?.trim() || "",
        barcode: newProduct.barcode?.trim() || "",
      });

      setIsCreateOpen(false);
      setNewProduct({
        name: "",
        description: "",
        minimumStock: 0,
        category: "COSMETICO_VENTA",
        brand: "LIDHERMA",
        expirable: false,
        scope: "BOTH",
        barcode: "",
        costPrice: 0,
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo crear el producto");
    }
  };

  const onSubmitPurchase = async () => {
    try {
      if (!selectedProduct) {
        toast.error("Seleccioná un producto");
        return;
      }

      const quantity = Number(purchaseForm.quantity);
      const amount = Number(purchaseForm.amount);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        toast.error("La cantidad debe ser mayor a cero");
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("El monto debe ser mayor a cero");
        return;
      }

      await handlePurchase({
        productId: selectedProduct.id,
        quantity,
        amount,
        comment: purchaseForm.comment.trim(),
      });

      setIsPurchaseOpen(false);
      setSelectedProduct(null);
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
        productName={selectedProduct?.name ?? ""}
        form={purchaseForm}
        setForm={setPurchaseForm}
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