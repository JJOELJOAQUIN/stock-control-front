import { useState } from "react";
import { toast } from "sonner";
import { Barcode, Search } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";

import type { PaymentMethod } from "../../types/cash.types";
import type { ProductScanResponse } from "@/features/stock/types/stock.types";

const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "TRANSFER",
  "DEBIT",
  "CREDIT",
];

type Props = {
  scannedProduct: ProductScanResponse | null;
  barcodeQuery: string;
  setBarcodeQuery: (value: string) => void;
  isScanning: boolean;
  isSelling: boolean;
  onScan: () => Promise<void>;
  onSell: (payload: {
    barcode: string;
    quantity: number;
    amount: number;
    paymentMethod: PaymentMethod;
    comment?: string;
  }) => Promise<void>;
};

export function InlineProductSaleCard({
  scannedProduct,
  barcodeQuery,
  setBarcodeQuery,
  isScanning,
  isSelling,
  onScan,
  onSell,
}: Props) {
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [comment, setComment] = useState("");

  const handleSell = async () => {
    if (!scannedProduct?.barcode) {
      toast.error("Primero escaneá un producto");
      return;
    }

    const parsedQty = Number(quantity);
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    await onSell({
      barcode: scannedProduct.barcode,
      quantity: parsedQty,
      amount: parsedAmount,
      paymentMethod,
      comment: comment.trim() || "Venta de producto desde caja consultorio",
    });

    setQuantity("1");
    setAmount("");
    setComment("");
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Venta directa de producto</h2>
        <p className="text-sm text-muted-foreground">
          Escaneá un producto y registrá la venta desde caja consultorio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
        <div className="space-y-2">
          <Label>Código de barras</Label>
          <div className="relative">
            <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              placeholder="Escanear o ingresar barcode..."
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onScan();
                }
              }}
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onScan}
          disabled={!barcodeQuery.trim() || isScanning}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Buscar
        </Button>
      </div>

      {scannedProduct && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">{scannedProduct.name}</p>
              <p className="text-sm text-muted-foreground">
                Barcode: {scannedProduct.barcode}
              </p>
              <p className="text-sm text-muted-foreground">
                Scope: {scannedProduct.scope}
              </p>
            </div>

            <div className="flex gap-2">
              <Badge
                variant={scannedProduct.belowMinimum ? "destructive" : "default"}
              >
                Stock actual: {scannedProduct.currentStock}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label>Monto</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Método de pago</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
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
            <Button onClick={handleSell} disabled={isSelling}>
              Registrar venta
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}