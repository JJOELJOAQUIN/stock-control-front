import * as pdfjsLib from "pdfjs-dist";
// Vite resuelve el worker como URL. Si usás otro bundler, ajustá esta línea.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { parseLacrozeLines, type LacrozeParseResult } from "./lacrozeParser";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// El parseo vive en lacrozeParser.ts (sin pdfjs, testeable). Se re-exporta
// acá para no romper los imports existentes.
export {
  parseLacrozeLines,
  type LacrozeLine,
  type LacrozeMeta,
  type LacrozeParseResult,
} from "./lacrozeParser";

/** Extrae las lineas de texto de un PDF (capa de texto, sin OCR). */
export async function extractLinesFromPdf(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const allLines: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items = content.items
      .map((raw) => {
        const anyItem = raw as { str?: string; transform?: number[] };
        if (!anyItem.transform) return null;
        return {
          str: anyItem.str ?? "",
          x: anyItem.transform[4],
          y: anyItem.transform[5],
        };
      })
      .filter((x): x is { str: string; x: number; y: number } => x !== null);
    allLines.push(...itemsToLines(items));
  }
  return allLines;
}

/** Reconstruye lineas agrupando fragmentos por su coordenada vertical. */
function itemsToLines(
  items: { str: string; x: number; y: number }[]
): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: { y: number; parts: { str: string; x: number }[] }[] = [];
  const TOL = 2.5;

  for (const it of sorted) {
    const row = rows.find((r) => Math.abs(r.y - it.y) <= TOL);
    if (row) row.parts.push({ str: it.str, x: it.x });
    else rows.push({ y: it.y, parts: [{ str: it.str, x: it.x }] });
  }

  return rows.map((r) =>
    r.parts
      .sort((a, b) => a.x - b.x)
      .map((p) => p.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Parser de PDF de punta a punta (extrae + parsea). Compatibilidad. */
export async function parseLacrozePdf(file: File): Promise<LacrozeParseResult> {
  const lines = await extractLinesFromPdf(file);
  return parseLacrozeLines(lines);
}