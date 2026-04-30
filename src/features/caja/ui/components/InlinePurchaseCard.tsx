"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";
import type { ProductWithStock } from "@/features/stock/types/stock.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
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
  }) => Promise<void>;
};

export function InlineProductPurchaseCard({
  products,
  isSubmitting,
  onPurchase,
}: Props) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!productId) {
      toast.error("Seleccioná un producto");
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    await onPurchase({
      productId,
      quantity: parsedQuantity,
      amount: parsedAmount,
      comment: comment.trim() || "Compra de producto desde caja consultorio",
    });

    setQuantity("1");
    setAmount("");
    setComment("");
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
              Registrar ingreso de stock y egreso de caja desde consultorio
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
              <FieldLabel>Monto total</FieldLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </Field>

            <Field>
              <FieldLabel>Comentario</FieldLabel>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Opcional"
              />
            </Field>
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
