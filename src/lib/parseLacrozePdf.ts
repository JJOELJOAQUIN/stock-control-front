import * as pdfjsLib from "pdfjs-dist";
// Vite resuelve el worker como URL. Si usás otro bundler, ajustá esta línea.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Parser de la factura de Farmacia Magistral Lacroze (formato Sigma Software).
 *
 * El PDF es digital (tiene capa de texto y QR de ARCA), así que se lee sin OCR.
 * OJO con el "CÓDIGO" de la factura: NO es identificador de producto — es un
 * código de familia (01004 = todos los serums, 01007 = contornos, etc.), se
 * repite entre productos distintos. Por eso el match contra el catálogo se hace
 * SIEMPRE por descripción, nunca por ese código. Acá el código se guarda solo
 * como referencia informativa.
 */

export type LacrozeLine = {
  /** Código de familia de la factura (informativo, no identifica el producto). */
  codigo: string;
  /** Descripción tal cual la factura. Es la clave de match contra el catálogo. */
  descripcion: string;
  /** Cantidad de envases comprados. */
  cantidad: number;
  /** Precio por envase (costo unitario). */
  precioUnit: number;
  /** Importe de la línea segun la factura (cantidad * precioUnit). */
  importe: number;
  /** true si cantidad * precioUnit no coincide con el importe impreso. */
  importeDescuadra: boolean;
};

export type LacrozeMeta = {
  factura: string | null;
  fecha: string | null;
  cae: string | null;
  /** Total impreso en la factura. */
  totalFactura: number | null;
};

export type LacrozeParseResult = {
  meta: LacrozeMeta;
  lines: LacrozeLine[];
  /** Suma de los importes de las líneas parseadas. */
  totalCalculado: number;
  /** Avisos no bloqueantes (descuadres, total que no coincide, etc.). */
  warnings: string[];
};

// Línea de ítem: codigo | descripción | cantidad | UN | precio_unit | importe
const ITEM_RE = /^(\d{4,6})\s+(.+?)\s+(\d+)\s+UN\s+([\d.,]+)\s+([\d.,]+)$/;

/**
 * Convierte un número que puede venir en formato "42448.000" (punto decimal,
 * como exporta Sigma) o "1.234,50" (formato AR con miles) a Number.
 */
function parseNum(raw: string): number {
  const s = raw.trim();
  if (s.includes(".") && s.includes(",")) {
    // "1.234,50" -> miles con punto, decimal con coma
    return Number(s.replace(/\./g, "").replace(",", "."));
  }
  if (s.includes(",") && !s.includes(".")) {
    // "1234,50" -> decimal con coma
    return Number(s.replace(",", "."));
  }
  // "42448.000" / "42448.00" -> punto decimal
  return Number(s);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Reconstruye las líneas de texto de una página agrupando los fragmentos por
 * su coordenada vertical (con tolerancia), y ordenando cada línea por X. Es
 * más robusto que confiar en el orden de lectura crudo de pdf.js.
 */
function itemsToLines(
  items: { str: string; x: number; y: number }[]
): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: { y: number; parts: { str: string; x: number }[] }[] = [];
  const TOL = 2.5; // px de tolerancia para considerar "misma línea"

  for (const it of sorted) {
    const row = rows.find((r) => Math.abs(r.y - it.y) <= TOL);
    if (row) {
      row.parts.push({ str: it.str, x: it.x });
    } else {
      rows.push({ y: it.y, parts: [{ str: it.str, x: it.x }] });
    }
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

export async function parseLacrozePdf(file: File): Promise<LacrozeParseResult> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const allLines: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items = content.items
      .map((raw) => {
        // Cada item de pdf.js trae str y transform [a,b,c,d,e,f]: e=x, f=y.
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

  const fullText = allLines.join("\n");
  const warnings: string[] = [];

  // ---- Ítems ----
  const lines: LacrozeLine[] = [];
  for (const raw of allLines) {
    const line = raw.replace(/\s+/g, " ").trim();
    const m = ITEM_RE.exec(line);
    if (!m) continue;

    const [, codigo, descripcion, cantidadStr, precioStr, importeStr] = m;
    const cantidad = parseInt(cantidadStr, 10);
    const precioUnit = parseNum(precioStr);
    const importe = parseNum(importeStr);
    const importeDescuadra =
      Math.abs(round2(cantidad * precioUnit) - round2(importe)) > 0.01;

    if (importeDescuadra) {
      warnings.push(
        `"${descripcion.trim()}": ${cantidad} x ${precioUnit} no da ${importe}.`
      );
    }

    lines.push({
      codigo,
      descripcion: descripcion.trim(),
      cantidad,
      precioUnit,
      importe,
      importeDescuadra,
    });
  }

  // ---- Metadata ----
  const factura = /FACTURA\s*N[º°o]?\s*([\d-]+)/i.exec(fullText)?.[1] ?? null;
  const fecha = /(\d{2}\/\d{2}\/\d{4})/.exec(fullText)?.[1] ?? null;
  const cae = /CAE\s*N[º°o]?\s*:?\s*(\d{6,})/i.exec(fullText)?.[1] ?? null;
  const totalMatch = /\$\s*([\d.,]+)/.exec(fullText);
  const totalFactura = totalMatch ? parseNum(totalMatch[1]) : null;

  const totalCalculado = round2(
    lines.reduce((acc, l) => acc + l.cantidad * l.precioUnit, 0)
  );

  if (lines.length === 0) {
    warnings.push(
      "No se detectó ninguna línea de producto. ¿Es una factura de Lacroze con capa de texto (no escaneada)?"
    );
  }
  if (totalFactura != null && Math.abs(totalFactura - totalCalculado) > 0.01) {
    warnings.push(
      `El total de la factura (${totalFactura}) no coincide con la suma de las líneas (${totalCalculado}).`
    );
  }

  return {
    meta: { factura, fecha, cae, totalFactura },
    lines,
    totalCalculado,
    warnings,
  };
}