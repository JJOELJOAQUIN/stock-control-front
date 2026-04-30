
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  Package,
  ArrowUpDown,
  FileText,
  Hash,
  Calendar,
  RotateCcw,
  Filter,
} from "lucide-react";
import type { StockMovementReason, StockMovementType } from "../ui/types/movements.types";

interface ProductWithStock {
  id: string;
  name: string;
}

const MOVEMENT_TYPES: { value: StockMovementType; label: string }[] = [
  { value: "IN", label: "Entrada" },
  { value: "OUT", label: "Salida" },
  { value: "ADJUST", label: "Ajuste" },
];

const MOVEMENT_REASONS: { value: StockMovementReason; label: string }[] = [
  { value: "COMPRA_PROVEEDOR", label: "Compra a proveedor" },
  { value: "VENTA", label: "Venta" },
  { value: "AJUSTE_ERROR", label: "Ajuste por error" },
  { value: "DEVOLUCION", label: "Devolucion" },
  { value: "MERMA", label: "Merma" },
];

type Props = {
  products: ProductWithStock[];
  selectedProductId: string;
  setSelectedProductId: (value: string) => void;
  type: StockMovementType | "ALL";
  setType: (value: StockMovementType | "ALL") => void;
  reason: StockMovementReason | "ALL";
  setReason: (value: StockMovementReason | "ALL") => void;
  minQty: string;
  setMinQty: (value: string) => void;
  maxQty: string;
  setMaxQty: (value: string) => void;
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  onReset: () => void;
};

export function MovementsFilters({
  products,
  selectedProductId,
  setSelectedProductId,
  type,
  setType,
  reason,
  setReason,
  minQty,
  setMinQty,
  maxQty,
  setMaxQty,
  from,
  setFrom,
  to,
  setTo,
  onReset,
}: Props) {
  const hasActiveFilters =
    Boolean(selectedProductId) ||
    type !== "ALL" ||
    reason !== "ALL" ||
    Boolean(minQty) ||
    Boolean(maxQty) ||
    Boolean(from) ||
    Boolean(to);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
            <CardDescription>
              Filtra los movimientos por producto, tipo, motivo y fecha
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Producto */}
          <Field>
            <FieldLabel className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-primary" />
              Producto
            </FieldLabel>
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
            >
              <SelectTrigger className="mt-1.5 border-input bg-background">
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Tipo */}
          <Field>
            <FieldLabel className="flex items-center gap-2 text-sm font-medium">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              Tipo
            </FieldLabel>
            <Select
              value={type}
              onValueChange={(v) => setType(v as StockMovementType | "ALL")}
            >
              <SelectTrigger className="mt-1.5 border-input bg-background">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {MOVEMENT_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Motivo */}
          <Field>
            <FieldLabel className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" />
              Motivo
            </FieldLabel>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as StockMovementReason | "ALL")}
            >
              <SelectTrigger className="mt-1.5 border-input bg-background">
                <SelectValue placeholder="Todos los motivos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {MOVEMENT_REASONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Cantidad */}
          <Field>
            <FieldLabel className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4 text-primary" />
              Rango de cantidad
            </FieldLabel>
            <div className="mt-1.5 flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                className="flex-1 border-input bg-background"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxQty}
                onChange={(e) => setMaxQty(e.target.value)}
                className="flex-1 border-input bg-background"
              />
            </div>
          </Field>

          {/* Desde */}
          <Field>
            <FieldLabel className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Desde
            </FieldLabel>
            <Input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1.5 border-input bg-background"
            />
          </Field>

          {/* Hasta */}
          <Field>
            <FieldLabel className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Hasta
            </FieldLabel>
            <Input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1.5 border-input bg-background"
            />
          </Field>
        </FieldGroup>

        {/* Actions */}
        <div className="flex justify-end border-t border-border/50 pt-2">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
