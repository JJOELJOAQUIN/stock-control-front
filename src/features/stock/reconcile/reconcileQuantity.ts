import { fitsScale, fromStored, parseDecimal, toStored, unitShort } from "@/lib/units";

export type ReconcileMode = "total" | "add";

type Computed = {
  /** Stock final en unidades guardadas, o null si lo tipeado no es válido. */
  targetStored: number | null;
  touched: boolean;
  error: string | null;
};

/**
 * Calcula el stock final a partir de lo que cargó la persona:
 *  - "total": lo que hay físicamente en total (el stock queda en eso).
 *  - "add":   lo que se agrega a lo que ya figura (ej. figura 1, tengo 18 en
 *             total -> sumo 17).
 */
export function computeTarget(
  mode: ReconcileMode,
  raw: string,
  currentStored: number,
  scale: number
): Computed {
  if (raw.trim() === "") return { targetStored: null, touched: false, error: null };
  const value = parseDecimal(raw);
  if (!Number.isFinite(value) || value < 0) {
    return { targetStored: null, touched: true, error: "Ingresá un número válido." };
  }
  if (!fitsScale(value, scale)) {
    return {
      targetStored: null,
      touched: true,
      error: scale > 1 ? "Usá como máximo 1 decimal (ej: 7,5)." : "Usá números enteros.",
    };
  }
  const stored = toStored(value, scale);
  return {
    targetStored: mode === "total" ? stored : currentStored + stored,
    touched: true,
    error: null,
  };
}

/** Para mensajes: cantidad guardada con unidad siempre visible. */
export function qtyWithUnit(stored: number, unit: string | null | undefined, scale: number) {
  const n = fromStored(stored, scale).toLocaleString("es-AR", { maximumFractionDigits: 2 });
  return `${n} ${unitShort(unit)}`;
}
