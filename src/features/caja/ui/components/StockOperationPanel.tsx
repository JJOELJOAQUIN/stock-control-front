import { Barcode, DollarSign, ShoppingCart, ScanLine, Package } from "lucide-react";


import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Badge } from "@/shared/components/ui/badge";
import type { BusinessContext, ProductScanResponse } from "@/features/stock/types/stock.types";

type Props = {
  context: BusinessContext | null;
  barcodeQuery: string;
  setBarcodeQuery: (value: string) => void;
  scannedProduct: ProductScanResponse | null;
  isScanning: boolean;
  onScan: () => void;
  onOpenSell: () => void;
  onOpenPurchaseFromScan: () => void;
  /** Habilita el botón "Comprar" desde el escaneo. Default: true. */
  canPurchase?: boolean;
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
  canPurchase = true,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanLine className="h-5 w-5 text-primary" />
          Operaciones Rapidas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <Field className="flex-1">
            <FieldLabel>Escanear producto</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Barcode className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Ingresa o escanea codigo de barras..."
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && barcodeQuery.trim() && context) {
                    onScan();
                  }
                }}
              />
            </InputGroup>
          </Field>

          <div className="flex gap-2">
            <Button
              onClick={onScan}
              disabled={!barcodeQuery.trim() || !context || isScanning}
              className="min-w-[120px]"
            >
              {isScanning ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Buscando...
                </>
              ) : (
                "Buscar"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onOpenSell}
              disabled={!scannedProduct}
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Vender
            </Button>
          </div>
        </div>

        {scannedProduct && (
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 p-5 dark:border-emerald-800/50 dark:from-emerald-950/30 dark:to-teal-950/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-foreground">
                    {scannedProduct.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="font-mono">{scannedProduct.barcode}</span>
                    <span>|</span>
                    <span>{scannedProduct.scope}</span>
                    {context && (
                      <>
                        <span>|</span>
                        <span className="capitalize">{context.toLowerCase()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant={scannedProduct.belowMinimum ? "destructive" : "default"}
                  className="px-3 py-1.5 text-sm"
                >
                  Stock: {scannedProduct.currentStock}
                </Badge>

                {canPurchase && (
                  <Button variant="secondary" className="gap-2" onClick={onOpenPurchaseFromScan}>
                    <ShoppingCart className="h-4 w-4" />
                    Comprar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}