"use client";

import { useEffect, useState } from "react";
import { Barcode, Search, ShoppingBag } from "lucide-react";

import type { PaymentMethod, CashActor } from "../../types/cash.types";
import type { ProductScanResponse } from "@/features/stock/types/stock.types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldGroup } from "@/shared/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { ProductSaleDialog, type SaleDraftLine } from "./ProductSaleDialog";

type Props = {
  scannedProduct: ProductScanResponse | null;
  barcodeQuery: string;
  setBarcodeQuery: (value: string) => void;
  isScanning: boolean;
  isSelling: boolean;
  onScan: () => Promise<void>;
  nameResults: ProductScanResponse[];
  onSelectByName: (product: ProductScanResponse) => void;
  onSell: (payload: {
    barcode: string;
    quantity: number;
    amount: number;
    paymentMethod: PaymentMethod;
    performedBy: CashActor;
    comment?: string;
  }) => Promise<void>;
  /**
   * Puente a la venta combinada. Esta card sólo lo pasa hacia abajo: quien
   * abre el carrito es la página, que es la que tiene productos y
   * procedimientos cargados.
   */
  onAddMore?: (draft: SaleDraftLine) => void;
};

export function InlineProductSaleCard({
  scannedProduct,
  barcodeQuery,
  setBarcodeQuery,
  isScanning,
  isSelling,
  onScan,
  nameResults,
  onSelectByName,
  onSell,
  onAddMore,
}: Props) {
  const [isSaleOpen, setIsSaleOpen] = useState(false);

  // Cuando aparece un producto (por barcode o por nombre), abre el modal.
  useEffect(() => {
    if (scannedProduct) setIsSaleOpen(true);
  }, [scannedProduct]);

  return (
    <Card className="border-emerald-200/30 dark:border-emerald-800/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <CardTitle>Venta directa de producto</CardTitle>
            <CardDescription>
              Buscá por código de barras o nombre para registrar la venta
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-4">
          {/* Buscador */}
          <div className="flex gap-3">
            <Field className="flex-1">
              <InputGroup>
                <InputGroupAddon>
                  <Barcode className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  value={barcodeQuery}
                  onChange={(e) => setBarcodeQuery(e.target.value)}
                  placeholder="Código de barras o nombre del producto..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onScan();
                  }}
                />
              </InputGroup>
            </Field>
            <Button
              variant="outline"
              onClick={() => void onScan()}
              disabled={!barcodeQuery.trim() || isScanning}
            >
              {isScanning ? <Spinner /> : <Search className="size-4" />}
              Buscar
            </Button>
          </div>

          {/* Resultados por nombre: al elegir uno se abre el modal */}
          {nameResults.length > 0 && (
            <ul className="overflow-hidden rounded-md border" role="listbox">
              {nameResults.map((product) => (
                <li key={product.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => onSelectByName(product)}
                    className="flex w-full items-center justify-between border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {product.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {product.barcode} · Stock: {product.currentStock}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm text-emerald-600 dark:text-emerald-400">
                      {product.salePrice != null
                        ? currencyFormatter.format(product.salePrice)
                        : "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </FieldGroup>
      </CardContent>

      {/* Detalle + formulario de venta en modal */}
      <ProductSaleDialog
        open={isSaleOpen}
        onOpenChange={setIsSaleOpen}
        product={scannedProduct}
        isSelling={isSelling}
        onSell={onSell}
        onAddMore={onAddMore}
      />
    </Card>
  );
}