import type { ProductWithStock } from "@/features/stock/types/stock.types";
import { fitsScale, parseDecimal, scaleOf, toStored } from "@/lib/units";

/** Un insumo cargado a mano para una sesión, en unidades REALES ("1,5"). */
export type ConsumptionDraft = { productId: string; quantity: string };

export type ConsumptionLine = { productId: string; quantity: number };

/**
 * Valida y convierte lo cargado a unidades guardadas (ML en décimas).
 * Devuelve el error a mostrar, o las líneas listas para mandar.
 */
export function toConsumptionLines(
  drafts: ConsumptionDraft[],
  products: ProductWithStock[],
  procedureLabel: string
): { error: string } | { lines: ConsumptionLine[] } {
  const lines: ConsumptionLine[] = [];
  for (const d of drafts) {
    const p = products.find((x) => x.id === d.productId);
    if (!p) return { error: `${procedureLabel}: elegí el insumo (o sacá la línea).` };
    const scale = scaleOf(p.unitScale);
    const value = parseDecimal(d.quantity);
    if (!(value > 0) || !fitsScale(value, scale)) {
      return {
        error:
          scale > 1
            ? `${procedureLabel}: ${p.name} — poné los ml con hasta 1 decimal (ej: 1,5).`
            : `${procedureLabel}: ${p.name} — la cantidad tiene que ser un entero mayor a 0.`,
      };
    }
    lines.push({ productId: p.id, quantity: toStored(value, scale) });
  }
  return { lines };
}
