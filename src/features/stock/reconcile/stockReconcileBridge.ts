/**
 * Puente entre la capa HTTP (customBaseQuery) y el diálogo "Editar stock".
 *
 * Cuando el backend responde 409 INSUFFICIENT_STOCK, customBaseQuery llama a
 * requestStockReconcile(...) y ESPERA: el diálogo (montado una sola vez en
 * main.tsx) se abre, la persona carga el stock real y el diálogo resuelve la
 * promesa con true (stock corregido -> se reintenta la carga original) o
 * false (canceló -> la carga falla con el error de siempre).
 */

export type InsufficientStockInfo = {
  code: "INSUFFICIENT_STOCK";
  message: string;
  productId: string;
  productName: string;
  context: "LOCAL" | "CONSULTORIO";
  available: number;
  requested: number;
  unit: string;
  unitsPerPackage: number;
};

type Listener = (info: InsufficientStockInfo, resolve: (ok: boolean) => void) => void;

let listener: Listener | null = null;

/** El diálogo se registra acá. Devuelve la función para desregistrarse. */
export function registerStockReconcileListener(fn: Listener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

/** Pide reconciliar. Si no hay diálogo montado, resuelve false (sin cambios). */
export function requestStockReconcile(info: InsufficientStockInfo): Promise<boolean> {
  const current = listener;
  if (!current) return Promise.resolve(false);
  return new Promise((resolve) => current(info, resolve));
}

export function isInsufficientStockError(data: unknown): data is InsufficientStockInfo {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { code?: unknown }).code === "INSUFFICIENT_STOCK" &&
    typeof (data as { productId?: unknown }).productId === "string"
  );
}
