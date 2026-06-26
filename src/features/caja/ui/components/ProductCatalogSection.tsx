import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { MoreHorizontal, Pencil, Plus, Search, ShoppingCart, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import type { ProductWithStock } from "@/features/stock/types/stock.types";

type Props = {
  products: ProductWithStock[];
  isLoading: boolean;
  search: string;
  setSearch: (value: string) => void;
  onOpenCreate: () => void;
  onOpenPurchase: (product: ProductWithStock) => void;
  onOpenEdit: (product: ProductWithStock) => void;
  onDeactivate: (product: ProductWithStock) => void;
  isDeactivating?: boolean;
  /** Muestra la columna "Costo". Default: true. */
  showCost?: boolean;
  /** Habilita la acción "Registrar compra" por fila. Default: true. */
  canPurchase?: boolean;
};

const formatCurrency = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(num);
};

export function ProductCatalogSection({
  products,
  isLoading,
  search,
  setSearch,
  onOpenCreate,
  onOpenPurchase,
  onOpenEdit,
  onDeactivate,
  isDeactivating = false,
  showCost = true,
  canPurchase = true,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Catalogo de Productos</CardTitle>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <InputGroup className="w-full sm:w-80">
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Buscar por nombre, marca, categoria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>

            <Button className="gap-2 whitespace-nowrap" onClick={onOpenCreate}>
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Empty className="py-12">
            <EmptyMedia variant="icon" className="h-12 w-12">
              <Search className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Sin productos</EmptyTitle>
            <EmptyDescription>
              No se encontraron productos para este contexto o busqueda.
            </EmptyDescription>
            <Button onClick={onOpenCreate} className="mt-3">
              <Plus className="h-4 w-4" />
              Crear producto
            </Button>
          </Empty>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="group">
                  <TableHead className="font-semibold">Producto</TableHead>
                  <TableHead className="font-semibold">Marca</TableHead>
                  <TableHead className="font-semibold">Categoria</TableHead>
                  <TableHead className="text-center font-semibold">Stock</TableHead>

                  {showCost && (
                    <TableHead className="text-center font-semibold">Costo</TableHead>
                  )}
                  <TableHead className="text-center font-semibold">Venta</TableHead>
                  <TableHead className="text-center font-semibold">Margen</TableHead>
                  <TableHead className="text-center font-semibold">Estado</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="group"
                  >
                    <TableCell className="transition-colors group-hover:bg-primary/5">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{product.name}</p>
                        {product.barcode && (
                          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {product.barcode}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="transition-colors group-hover:bg-primary/5">
                      <Badge variant="outline" className="font-normal">
                        {product.brand}
                      </Badge>
                    </TableCell>

                    <TableCell className="transition-colors group-hover:bg-primary/5">
                      {product.category.replace(/_/g, " ")}
                    </TableCell>

                    <TableCell className="transition-colors group-hover:bg-primary/5">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-lg font-bold tabular-nums ${product.belowMinimum
                            ? "text-destructive"
                            : "text-foreground"
                            }`}
                        >
                          {product.currentStock}
                        </span>
                        {product.belowMinimum && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] text-black dark:text-white"
                          >
                            Min: {product.minimumStock}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {showCost && (
                      <TableCell className="transition-colors text-center group-hover:bg-primary/5">
                        {formatCurrency(product.costPrice)}
                      </TableCell>
                    )}



                    <TableCell className="transition-colors text-center group-hover:bg-primary/5">
                      {formatCurrency(product.salePrice)}
                    </TableCell>

                    <TableCell className="transition-colors text-center group-hover:bg-primary/5">
                      {product.defaultMarkupPercentage != null
                        ? `${product.defaultMarkupPercentage}%`
                        : "-"}
                    </TableCell>

                    <TableCell className="transition-colors text-center group-hover:bg-primary/5">
                      <Badge
                        variant={product.active ? "default" : "secondary"}
                        className={
                          product.active
                            ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                            : ""
                        }
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>

                    <TableCell className="transition-colors group-hover:bg-primary/5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 "
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onOpenEdit(product)}>
                            <Pencil className="h-4 w-4" />
                            Editar producto
                          </DropdownMenuItem>
                          {canPurchase && (
                            <DropdownMenuItem onClick={() => onOpenPurchase(product)}>
                              <ShoppingCart className="h-4 w-4" />
                              Registrar compra
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeactivate(product)}
                            disabled={!product.active || isDeactivating}
                            className="text-destructive focus:text-destructive"
                          >
                            {isDeactivating ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Desactivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}