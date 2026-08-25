import type { ProductWithStock } from "@/features/stock/types/stock.types";
import type { LacrozeLine } from "./parseLacrozePdf";

/**
 * Resuelve cada línea de la factura contra el catálogo, SIEMPRE por nombre
 * (el "código" de la factura es de familia, no identifica el producto).
 *
 *   - "matched"    -> nombre normalizado idéntico a un producto del catálogo.
 *   - "suggested"  -> no hay exacto, pero hay un candidato parecido (el usuario
 *                     lo confirma o elige otro).
 *   - "unmatched"  -> no hay candidato: hay que elegir a mano o crear el producto.
 *
 * El estado "suggested"/"unmatched" bloquea la confirmación hasta resolverlo.
 */

export type MatchStatus = "matched" | "suggested" | "unmatched";

export type MatchedLine = LacrozeLine & {
  status: MatchStatus;
  /** Producto asignado (por match exacto, sugerencia aceptada o elección manual). */
  productId: string | null;
  /** Mejor candidato sugerido cuando no hay match exacto. */
  suggestionId: string | null;
};

/** Normaliza para comparar: mayúsculas, sin acentos, sin puntuación, 1 espacio. */
export function normalizeName(value: string): string {
  return value
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokens(value: string): Set<string> {
  return new Set(normalizeName(value).split(" ").filter(Boolean));
}

/** Similitud Jaccard de tokens: 0..1. Simple y suficiente para sugerir. */
function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

const SUGGEST_THRESHOLD = 0.6;

export function matchLacrozeLines(
  lines: LacrozeLine[],
  products: ProductWithStock[]
): MatchedLine[] {
  // Índice por nombre normalizado para el match exacto.
  const byNorm = new Map<string, ProductWithStock>();
  for (const p of products) {
    if (!p.active) continue;
    byNorm.set(normalizeName(p.name), p);
  }

  return lines.map((line) => {
    const norm = normalizeName(line.descripcion);
    const exact = byNorm.get(norm);
    if (exact) {
      return { ...line, status: "matched", productId: exact.id, suggestionId: null };
    }

    // Sin match exacto: buscar el candidato más parecido.
    let best: ProductWithStock | null = null;
    let bestScore = 0;
    for (const p of products) {
      if (!p.active) continue;
      const score = similarity(line.descripcion, p.name);
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }

    if (best && bestScore >= SUGGEST_THRESHOLD) {
      return {
        ...line,
        status: "suggested",
        productId: null,
        suggestionId: best.id,
      };
    }

    return { ...line, status: "unmatched", productId: null, suggestionId: null };
  });
}

/** true si todas las líneas tienen un producto asignado (listo para confirmar). */
export function allResolved(lines: MatchedLine[]): boolean {
  return lines.length > 0 && lines.every((l) => l.productId != null);
}