import { CalendarClock, Trash2 } from "lucide-react";

import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { calcLineSubtotal, currencyFormatter, type PurchaseCartLine } from "@/shared/lib/purchase";
import type { CartLinePatch } from "../../hooks/usePurchaseChart";

type CartLineItemProps = {
  line: PurchaseCartLine;
  onChange: (lineId: string, patch: CartLinePatch) => void;
  onRemove: (lineId: string) => void;
};

const toNumber = (raw: string, min: number) => {
  if (raw === "") return min;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(min, n) : min;
};

export function CartLineItem({ line, onChange, onRemove }: CartLineItemProps) {
  const willEstimateExpiration =
    !line.expirationDate && line.shelfLifeMonths != null && line.shelfLifeMonths > 0;

  return (
    <li className="space-y-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium">{line.productName}</span>
        <button
          type="button"
          onClick={() => onRemove(line.lineId)}
          className="rounded text-destructive transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          aria-label={`Quitar ${line.productName}`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel className="text-xs">Cantidad</FieldLabel>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={line.quantity === 0 ? "" : String(line.quantity)}
            onChange={(e) => onChange(line.lineId, { quantity: toNumber(e.target.value, 1) })}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Costo unitario</FieldLabel>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={String(line.unitCost)}
            onChange={(e) => onChange(line.lineId, { unitCost: toNumber(e.target.value, 0) })}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Lote</FieldLabel>
          <Input
            placeholder="Opcional"
            value={line.lotNumber}
            onChange={(e) => onChange(line.lineId, { lotNumber: e.target.value })}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">
            Vencimiento{" "}
            {line.shelfLifeMonths != null && line.shelfLifeMonths > 0 && (
              <span className="font-normal text-muted-foreground">(opcional)</span>
            )}
          </FieldLabel>
          <Input
            type="date"
            value={line.expirationDate}
            onChange={(e) => onChange(line.lineId, { expirationDate: e.target.value })}
          />
          {willEstimateExpiration && (
            <p className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
              <CalendarClock className="size-3.5 shrink-0" />
              Se estimará automáticamente: +{line.shelfLifeMonths}{" "}
              {line.shelfLifeMonths === 1 ? "mes" : "meses"} desde hoy
            </p>
          )}
        </Field>
      </div>

      <div className="flex items-center justify-between border-t pt-2">
        <span className="text-xs text-muted-foreground">Subtotal</span>
        <span className="text-sm font-medium">
          {currencyFormatter.format(calcLineSubtotal(line))}
        </span>
      </div>
    </li>
  );
}