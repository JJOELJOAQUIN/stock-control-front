"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";

import type { ProductWithStock } from "@/features/stock/types/stock.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

type Props = {
  products: ProductWithStock[];
  isSubmitting: boolean;
  onPurchase: (payload: {
    productId: string;
    quantity: number;
    amount: number;
    comment?: string;
    expirationDate?: string | null;
    lotNumber?: string | null;
    updateCostPrice?: boolean;
    updateSalePrice?: boolean;
    newSalePrice?: number | null;
    updateMarkupPercentage: boolean;
newDefaultMarkupPercentage: string;
  }) => Promise<void>;
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export function InlineProductPurchaseCard({
  products,
  isSubmitting,
  onPurchase,
}: Props) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [lotNumber, setLotNumber] = useState("");

  const [updateCostPrice, setUpdateCostPrice] = useState(true);
  const [updateSalePrice, setUpdateSalePrice] = useState(false);
  const [newSalePrice, setNewSalePrice] = useState("");

  const selectedProduct = products.find((product) => product.id === productId);

  const parsedQuantity = Number(quantity) || 0;
  const parsedAmount = Number(amount) || 0;

  const unitCost =
    parsedQuantity > 0 && parsedAmount > 0
      ? parsedAmount / parsedQuantity
      : 0;

  const suggestedSalePrice =
    unitCost > 0 && selectedProduct?.defaultMarkupPercentage != null
      ? unitCost + unitCost * (selectedProduct.defaultMarkupPercentage / 100)
      : 0;

  const handleUpdateSalePriceChange = (checked: boolean) => {
    setUpdateSalePrice(checked);

    if (checked && suggestedSalePrice > 0) {
      setNewSalePrice(suggestedSalePrice.toFixed(2));
    }

    if (!checked) {
      setNewSalePrice("");
    }
  };

  const handleSubmit = async () => {
    if (!productId) {
      toast.error("Seleccioná un producto");
      return;
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    if (updateSalePrice) {
      const parsedNewSalePrice = Number(newSalePrice);

      if (!Number.isFinite(parsedNewSalePrice) || parsedNewSalePrice <= 0) {
        toast.error("El nuevo precio de venta debe ser mayor a cero");
        return;
      }
    }

    await onPurchase({
      productId,
      quantity: parsedQuantity,
      amount: parsedAmount,
      comment: comment.trim() || "Compra de producto desde caja consultorio",
      expirationDate: expirationDate || null,
      lotNumber: lotNumber.trim() || null,
      updateCostPrice,
      updateSalePrice,
      newSalePrice:
        updateSalePrice && Number(newSalePrice) > 0
          ? Number(newSalePrice)
          : null,
      updateMarkupPercentage: false,
      newDefaultMarkupPercentage: "0",
    });

    setProductId("");
    setQuantity("1");
    setAmount("");
    setComment("");
    setExpirationDate("");
    setLotNumber("");
    setUpdateCostPrice(true);
    setUpdateSalePrice(false);
    setNewSalePrice("");
  };

  return (
    <Card className="border-amber-200/30 dark:border-amber-800/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <PackagePlus className="size-5" />
          </div>

          <div>
            <CardTitle>Compra directa de producto</CardTitle>
            <CardDescription>
              Registrar ingreso de stock, egreso de caja y actualización opcional de precios
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Field>
              <FieldLabel>Producto</FieldLabel>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>

                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} · Stock: {product.currentStock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Cantidad</FieldLabel>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Monto total compra</FieldLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </Field>

            <Field>
              <FieldLabel>Número de lote</FieldLabel>
              <Input
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="Opcional"
              />
            </Field>

            <Field>
              <FieldLabel>Fecha de vencimiento</FieldLabel>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </Field>

            <Field className="md:col-span-3">
              <FieldLabel>Comentario</FieldLabel>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Opcional"
              />
            </Field>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-3 text-sm md:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Costo actual</p>
                <p className="font-semibold">
                  {selectedProduct.costPrice != null
                    ? currencyFormatter.format(selectedProduct.costPrice)
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Precio público actual</p>
                <p className="font-semibold">
                  {selectedProduct.salePrice != null
                    ? currencyFormatter.format(selectedProduct.salePrice)
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Margen actual</p>
                <p className="font-semibold">
                  {selectedProduct.defaultMarkupPercentage != null
                    ? `${selectedProduct.defaultMarkupPercentage}%`
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Costo unitario calculado</p>
                <p className="font-semibold">
                  {unitCost > 0 ? currencyFormatter.format(unitCost) : "-"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 rounded-lg border p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={updateCostPrice}
                onChange={(e) => setUpdateCostPrice(e.target.checked)}
              />
              Actualizar costo del producto con el costo unitario de esta compra
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={updateSalePrice}
                onChange={(e) => handleUpdateSalePriceChange(e.target.checked)}
              />
              Actualizar precio de venta público
            </label>

            {updateSalePrice && (
              <Field>
                <FieldLabel>Nuevo precio de venta</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newSalePrice}
                  onChange={(e) => setNewSalePrice(e.target.value)}
                  placeholder="0.00"
                />

                {suggestedSalePrice > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Sugerido por margen actual:{" "}
                    <span className="font-medium">
                      {currencyFormatter.format(suggestedSalePrice)}
                    </span>
                  </p>
                )}
              </Field>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950 dark:hover:text-amber-300"
            >
              {isSubmitting && <Spinner />}
              <PackagePlus className="size-4" />
              Registrar compra
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}