import { useMemo } from "react";
import { FlaskConical, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useGetProcedureCatalogQuery,
  useGetRecipeQuery,
} from "@/features/treatments/ui/screens/api/procedureCatalogApi";
import type { ProductWithStock } from "@/features/stock/types/stock.types";
import { formatNumber, formatQty, fromStored, scaleOf, unitShort } from "@/lib/units";
import type { ConsumptionDraft } from "./procedureConsumption";

type Props = {
  procedureCode: string;
  products: ProductWithStock[];
  /** null = se descuenta la receta; array = lo cargado para esta sesión. */
  value: ConsumptionDraft[] | null;
  onChange: (value: ConsumptionDraft[] | null) => void;
  /** Solo ADMIN puede ajustar; el resto ve la receta. */
  canEdit: boolean;
};

/**
 * Insumos que descuenta un procedimiento en la venta. Muestra la receta y,
 * a la médica, le deja ajustarla para ESTA sesión: cuántos ml usó (cicatrices
 * según tamaño) o cambiar un insumo por otro (DMAE por otra ampolla).
 * La receta del catálogo no se toca.
 */
export function ProcedureConsumptionEditor({
  procedureCode,
  products,
  value,
  onChange,
  canEdit,
}: Props) {
  const { data: catalog = [] } = useGetProcedureCatalogQuery();
  const catalogId = catalog.find((c) => c.code === procedureCode)?.id;
  const { data: recipe = [], isFetching } = useGetRecipeQuery(catalogId ?? "", {
    skip: !catalogId,
  });

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const sorted = useMemo(
    () => [...products].filter((p) => p.active).sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const startEditing = () => {
    onChange(
      recipe.map((l) => ({
        productId: l.productId,
        quantity: formatNumber(fromStored(l.quantity, scaleOf(l.unitScale))),
      }))
    );
  };

  const patch = (i: number, p: Partial<ConsumptionDraft>) =>
    onChange((value ?? []).map((r, ri) => (ri === i ? { ...r, ...p } : r)));

  // ---- Vista: receta (no editada) ----
  if (value == null) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" />
        {isFetching ? (
          <span>Cargando insumos…</span>
        ) : recipe.length === 0 ? (
          <span>No descuenta insumos{canEdit ? " (podés cargar lo que usaste)" : ""}.</span>
        ) : (
          <span>
            Descuenta:{" "}
            {recipe
              .map((l) => `${formatQty(l.quantity, l.unit ?? "UNIDAD", l.unitScale)}${!l.unit || l.unit === "UNIDAD" ? " u." : ""} ${l.productName}`)
              .join(" · ")}
          </span>
        )}
        {canEdit && !isFetching && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={startEditing}
          >
            {recipe.length === 0 ? "Cargar insumos usados" : "Ajustar para esta sesión"}
          </Button>
        )}
      </div>
    );
  }

  // ---- Edición para esta sesión ----
  return (
    <div className="mt-2 space-y-2 rounded-md border border-violet-200 bg-violet-50/50 p-2.5 dark:border-violet-900 dark:bg-violet-950/20">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <FlaskConical className="h-3.5 w-3.5" />
          Insumos usados en esta sesión
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => onChange(null)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Usar receta
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Sin insumos: esta sesión no descuenta stock.
        </p>
      )}

      {value.map((row, i) => {
        const p = byId.get(row.productId);
        const unit = p?.consumptionUnit ?? "UNIDAD";
        const isMl = scaleOf(p?.unitScale) > 1;
        return (
          <div key={i} className="flex items-center gap-2">
            <Input
              inputMode={isMl ? "decimal" : "numeric"}
              value={row.quantity}
              onChange={(e) => patch(i, { quantity: e.target.value.replace(/[^\d.,]/g, "") })}
              className="h-8 w-16 text-center"
              placeholder={isMl ? "1,5" : "1"}
            />
            <span className="w-10 shrink-0 text-xs text-muted-foreground">{unitShort(unit)}</span>
            <Select value={row.productId || undefined} onValueChange={(v) => patch(i, { productId: v })}>
              <SelectTrigger className="h-8 min-w-0 flex-1 text-xs">
                <SelectValue placeholder="Elegí el insumo…" />
              </SelectTrigger>
              <SelectContent>
                {sorted.map((prod) => (
                  <SelectItem key={prod.id} value={prod.id}>
                    {prod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onChange(value.filter((_, ri) => ri !== i))}
              aria-label="Quitar insumo"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 gap-1 text-xs"
        onClick={() => onChange([...value, { productId: "", quantity: "" }])}
      >
        <Plus className="h-3.5 w-3.5" />
        Agregar insumo
      </Button>
    </div>
  );
}
