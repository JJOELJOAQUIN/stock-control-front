import { useState } from "react";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import type { ProductWithStock } from "@/features/stock/types/stock.types";

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
    <section className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Compra directa de producto</h2>
        <p className="text-sm text-muted-foreground">
          Registrar ingreso de stock y egreso de caja desde consultorio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2 md:col-span-1">
          <Label>Producto</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Seleccionar producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · Stock: {product.currentStock}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Cantidad</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Monto total</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Comentario</Label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2"
        >
          <PackagePlus className="h-4 w-4" />
          Registrar compra
        </Button>
      </div>
    </section>
  );
}