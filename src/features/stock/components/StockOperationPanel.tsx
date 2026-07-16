import { useMemo, useState } from "react";
import {
  Barcode,
  DollarSign,
  MinusCircle,
  Package,
  Pencil,
  ScanLine,
  Search,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";

import type {
  BusinessContext,
  ProductScanResponse,
  ProductWithStock,
} from "../types/stock.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Badge } from "@/shared/components/ui/badge";
import { currencyFormatter } from "@/shared/lib/purchase";

const MAX_RESULTS = 8;

type Props = {
  context: BusinessContext | null;
  barcodeQuery: string;
  setBarcodeQuery: (value: string) => void;
  scannedProduct: ProductScanResponse | null;
  isScanning: boolean;
  onScan: () => void;
  /** Venta simple por código de barras (flujo anterior, se mantiene). */
  onOpenSell: () => void;
  onOpenPurchaseFromScan: () => void;
  /** Habilita comprar. Default: true. */
  canPurchase?: boolean;

  /** Catálogo completo para la búsqueda por nombre. */
  products: ProductWithStock[];
  /** Venta multi-ítem; sin producto abre el carrito vacío. */
  onOpenMultiSale: (product?: ProductWithStock) => void;
  /** Consumo interno (uso personal / carrito-camilla / muestra...). */
  onOpenConsume: (product: ProductWithStock) => void;
  onOpenPurchase: (product: ProductWithStock) => void;
  onOpenEdit: (product: ProductWithStock) => void;
  /** Habilita editar producto. Default: true. */
  canManageProducts?: boolean;
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
  products,
  onOpenMultiSale,
  onOpenConsume,
  onOpenPurchase,
  onOpenEdit,
  canManageProducts = true,
}: Props) {
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<ProductWithStock | null>(null);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];

    return products
      .filter((p) => p.active)
      .filter((p) =>
        `${p.name} ${p.barcode ?? ""} ${p.brand}`.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [term, products]);

  const hasQuery = term.trim().length > 0;

  // Si el catálogo se refresca (por ej. después de vender/consumir), la
  // selección se re-sincroniza con la versión actualizada del producto.
  const selectedFresh = useMemo(() => {
    if (!selected) return null;
    return products.find((p) => p.id === selected.id) ?? selected;
  }, [selected, products]);

  const handleSelect = (product: ProductWithStock) => {
    setSelected(product);
    setTerm("");
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScanLine className="h-5 w-5 text-primary" />
            Operaciones Rapidas
          </CardTitle>

          <Button className="gap-2" onClick={() => onOpenMultiSale()}>
            <ShoppingBag className="h-4 w-4" />
            Venta multi-ítem
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---------- Búsqueda por nombre ---------- */}
        <div className="space-y-2">
          <Field>
            <FieldLabel>Buscar producto por nombre</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Ej: Labial Vitamina E, Urban Lait..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </InputGroup>
          </Field>

          {hasQuery && results.length === 0 && (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              No se encontraron productos para “{term.trim()}”.
            </p>
          )}

          {results.length > 0 && (
            <ul className="overflow-hidden rounded-md border" role="listbox">
              {results.map((product) => (
                <li key={product.id} role="option" aria-selected={selectedFresh?.id === product.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(product)}
                    className="flex w-full items-center justify-between gap-2 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{product.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        Stock: {product.currentStock}
                        {product.salePrice != null &&
                          ` · Venta: ${currencyFormatter.format(product.salePrice)}`}
                      </span>
                    </span>
                    <Badge
                      variant={product.currentStock === 0 ? "destructive" : "secondary"}
                      className="shrink-0"
                    >
                      {product.currentStock === 0 ? "Sin stock" : "Elegir"}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedFresh && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{selectedFresh.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {selectedFresh.currentStock} · Mín: {selectedFresh.minimumStock}
                      {selectedFresh.salePrice != null &&
                        ` · Venta: ${currencyFormatter.format(selectedFresh.salePrice)}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={selectedFresh.currentStock === 0}
                    onClick={() => onOpenMultiSale(selectedFresh)}
                  >
                    <DollarSign className="h-4 w-4" />
                    Vender
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={selectedFresh.currentStock === 0}
                    onClick={() => onOpenConsume(selectedFresh)}
                  >
                    <MinusCircle className="h-4 w-4" />
                    Consumir
                  </Button>

                  {canPurchase && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5"
                      onClick={() => onOpenPurchase(selectedFresh)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Comprar
                    </Button>
                  )}

                  {canManageProducts && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5"
                      onClick={() => onOpenEdit(selectedFresh)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ---------- Escaneo por código de barras (flujo anterior) ---------- */}
        <div className="flex flex-col gap-4 border-t pt-5 lg:flex-row lg:items-end">
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