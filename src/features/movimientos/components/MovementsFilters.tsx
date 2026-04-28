import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import type { ProductWithStock } from "@/features/stock/types/stock.types";
import type { StockMovementReason, StockMovementType } from "../ui/types/movements.types";

const MOVEMENT_TYPES: StockMovementType[] = ["IN", "OUT", "ADJUST"];
const MOVEMENT_REASONS: StockMovementReason[] = [
  "COMPRA_PROVEEDOR",
  "VENTA",
  "AJUSTE_ERROR",
];

type Props = {
  products: ProductWithStock[];
  selectedProductId: string;
  setSelectedProductId: (value: string) => void;
  type: StockMovementType | "";
  setType: (value: StockMovementType | "") => void;
  reason: StockMovementReason | "";
  setReason: (value: StockMovementReason | "") => void;
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
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Producto</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Seleccionar producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType((e.target.value || "") as StockMovementType | "")}
          >
            <option value="">Todos</option>
            {MOVEMENT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Motivo</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={reason}
            onChange={(e) => setReason((e.target.value || "") as StockMovementReason | "")}
          >
            <option value="">Todos</option>
            {MOVEMENT_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Cantidad mínima</Label>
          <Input value={minQty} onChange={(e) => setMinQty(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Cantidad máxima</Label>
          <Input value={maxQty} onChange={(e) => setMaxQty(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Desde</Label>
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Hasta</Label>
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}