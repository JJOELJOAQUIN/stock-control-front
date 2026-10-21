/**
 * Unidades de stock y su escala.
 *
 * El backend guarda TODAS las cantidades como enteros. Para que los ml
 * admitan fracciones (sesión de 1,5 ml, vial abierto con 2 ml), ML se guarda
 * en DÉCIMAS de ml: escala 10 (7,5 ml -> 75). El resto (unidades, ampollas,
 * disparos) tiene escala 1.
 *
 * Regla de oro: al usuario SIEMPRE se le muestra y se le pide la cantidad
 * real ("7,5 ml"), nunca el entero guardado. Convertir con toStored /
 * fromStored y mostrar con formatQty.
 *
 * La escala de un producto existente viene del backend (unitScale): así,
 * si el front se publica antes que la API, se sigue mostrando bien.
 */

export type ConsumptionUnit = "UNIDAD" | "ML" | "AMPOLLA" | "DISPARO";

export const UNIT_OPTIONS: { value: ConsumptionUnit; label: string }[] = [
  { value: "UNIDAD", label: "Unidades" },
  { value: "ML", label: "Mililitros (ml)" },
  { value: "AMPOLLA", label: "Ampollas / viales" },
  { value: "DISPARO", label: "Disparos" },
];

const SHORT: Record<string, string> = {
  UNIDAD: "u.",
  ML: "ml",
  AMPOLLA: "amp.",
  DISPARO: "disp.",
};

const LONG: Record<string, string> = {
  UNIDAD: "unidades",
  ML: "ml",
  AMPOLLA: "ampollas",
  DISPARO: "disparos",
};

/** Escala por defecto de una unidad (para productos nuevos). */
export function defaultScale(unit?: string | null): number {
  return unit === "ML" ? 10 : 1;
}

/** Escala efectiva: la del backend si vino; si no, 1 (datos sin escalar). */
export function scaleOf(serverScale?: number | null): number {
  return serverScale && serverScale > 0 ? serverScale : 1;
}

export function unitShort(unit?: string | null): string {
  return SHORT[unit ?? "UNIDAD"] ?? (unit ?? "").toLowerCase();
}

export function unitLong(unit?: string | null): string {
  return LONG[unit ?? "UNIDAD"] ?? (unit ?? "").toLowerCase();
}

/** Entero guardado -> cantidad real (75 en ML -> 7.5). */
export function fromStored(stored: number, scale: number): number {
  return stored / scale;
}

/** Cantidad real -> entero guardado (7.5 ml -> 75). */
export function toStored(value: number, scale: number): number {
  return Math.round(value * scale);
}

/** Número en formato argentino, sin decimales de más: 7.5 -> "7,5". */
export function formatNumber(value: number): string {
  return value.toLocaleString("es-AR", { maximumFractionDigits: 2, useGrouping: false });
}

/**
 * Cantidad guardada lista para mostrar. Para UNIDAD (retail) devuelve solo
 * el número, como siempre; para el resto agrega la unidad: "7,5 ml".
 */
export function formatQty(
  stored: number,
  unit?: string | null,
  serverScale?: number | null
): string {
  const n = formatNumber(fromStored(stored, scaleOf(serverScale)));
  if (!unit || unit === "UNIDAD") return n;
  return `${n} ${unitShort(unit)}`;
}

type WithStock = {
  currentStock: number;
  minimumStock?: number;
  consumptionUnit?: string | null;
  unitScale?: number | null;
};

/** Stock actual de un producto, listo para mostrar. */
export function stockLabel(p: WithStock): string {
  return formatQty(p.currentStock, p.consumptionUnit, p.unitScale);
}

/** Stock mínimo de un producto, listo para mostrar. */
export function minimumLabel(p: WithStock): string {
  return formatQty(p.minimumStock ?? 0, p.consumptionUnit, p.unitScale);
}

/**
 * Parsea lo que tipea el usuario aceptando coma o punto decimal.
 * Devuelve NaN si no es un número válido.
 */
export function parseDecimal(raw: string): number {
  const s = raw.trim().replace(",", ".");
  if (s === "" || !/^\d*\.?\d*$/.test(s)) return NaN;
  return Number(s);
}

/**
 * true si la cantidad real se puede guardar sin perder precisión con esta
 * escala (ML admite 1 decimal; el resto, enteros).
 */
export function fitsScale(value: number, scale: number): boolean {
  return Number.isFinite(value) && Math.abs(value * scale - Math.round(value * scale)) < 1e-9;
}
