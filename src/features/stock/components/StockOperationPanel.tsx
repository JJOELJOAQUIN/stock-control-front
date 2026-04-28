import { Barcode, DollarSign, ShoppingCart } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import type { BusinessContext, ProductScanResponse } from "../types/stock.types";


type Props = {
  context: BusinessContext | null;
  barcodeQuery: string;
  setBarcodeQuery: (value: string) => void;
  scannedProduct: ProductScanResponse | null;
  isScanning: boolean;
  onScan: () => void;
  onOpenSell: () => void;
  onOpenPurchaseFromScan: () => void;
};

export function StockOperationsPanel({
  context,
  barcodeQuery,
  setBarcodeQuery,
  scannedProduct,
  isScanning,
  onScan,
  onOpenSell,
  onOpenPurchaseFromScan,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="barcode-scan">Escanear producto</Label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="barcode-scan"
                placeholder="Ingresá código de barras..."
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={onScan}
            disabled={!barcodeQuery.trim() || !context || isScanning}
          >
            Buscar stock
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={onOpenSell}
          >
            <DollarSign className="h-4 w-4" />
            Vender
          </Button>
        </div>
      </div>

      {scannedProduct && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">{scannedProduct.name}</p>
              <p className="text-sm text-muted-foreground">
                Barcode: {scannedProduct.barcode}
              </p>
              <p className="text-sm text-muted-foreground">
                Scope: {scannedProduct.scope}
              </p>
              <p className="text-sm text-muted-foreground">
                Contexto: {context}
              </p>
            </div>

            <div className="flex gap-3">
              <Badge variant={scannedProduct.belowMinimum ? "destructive" : "default"}>
                Stock actual: {scannedProduct.currentStock}
              </Badge>

              <Button
                variant="secondary"
                className="gap-2"
                onClick={onOpenPurchaseFromScan}
              >
                <ShoppingCart className="h-4 w-4" />
                Comprar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}