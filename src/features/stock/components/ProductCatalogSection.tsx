import { Plus, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import type { ProductWithStock } from "../types/stock.types";


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
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, marca, categoría o barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button className="gap-2" onClick={onOpenCreate}>
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-right">Stock actual</TableHead>
                <TableHead className="text-right">Stock mín.</TableHead>
                <TableHead>Alerta</TableHead>
                <TableHead className="text-right">Costo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {product.barcode || "-"}
                  </TableCell>

                  <TableCell>{product.brand}</TableCell>

                  <TableCell>{product.category}</TableCell>

                  <TableCell>{product.scope}</TableCell>

                  <TableCell className="text-right font-semibold">
                    {product.currentStock}
                  </TableCell>

                  <TableCell className="text-right">
                    {product.minimumStock}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={product.belowMinimum ? "destructive" : "default"}
                    >
                      {product.belowMinimum ? "Bajo mínimo" : "Normal"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {product.costPrice != null
                      ? `$${Number(product.costPrice).toLocaleString()}`
                      : "-"}
                  </TableCell>

                  <TableCell>
                    <Badge variant={product.active ? "default" : "secondary"}>
                      {product.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenPurchase(product)}
                      >
                        Comprar
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenEdit(product)}
                      >
                        Editar
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeactivate(product)}
                        disabled={!product.active || isDeactivating}
                      >
                        Desactivar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center text-muted-foreground"
                  >
                    No se encontraron productos para este contexto
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}