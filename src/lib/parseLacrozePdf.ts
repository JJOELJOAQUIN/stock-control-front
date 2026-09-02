import * as pdfjsLib from "pdfjs-dist";
// Vite resuelve el worker como URL. Si usás otro bundler, ajustá esta línea.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Parser de compras de Farmacia Magistral Lacroze.
 *
 * Soporta DOS formatos, porque mandan distintos documentos:
 *
 *  1) FACTURA (PDF digital, con capa de texto y QR de ARCA):
 *     `codigo(4-6) descripcion CANT UN precio.000 importe.00`
 *     El precio viene con decimales y es exacto.
 *
 *  2) PEDIDO / PRESUPUESTO (foto JPG vía OCR, o PDF):
 *     `codigo(7-8) descripcion CANT precio importe`  (SIN "UN", enteros)
 *     Debajo de cada producto puede haber una línea "Envase: ..." que NO es un
 *     producto (es el gotero/envase, ya incluido en el costo) y se IGNORA.
 *     El precio que se ve está redondeado; el costo REAL es importe / cantidad.
 *
 * En los dos casos el match contra el catálogo se hace por DESCRIPCIÓN: el
 * "código" es de familia, no identifica el producto.
 *
 * La extracción de texto (PDF vs OCR) está separada del parseo: este módulo
 * expone parseLacrozeLines(lines) para reusarlo desde el OCR de imágenes.
 */

export type LacrozeLine = {
  codigo: string;
  descripcion: string;
  cantidad: number;
  /** Costo unitario. En pedido = importe/cantidad (real, no el redondeado). */
  precioUnit: number;
  importe: number;
  /** true si los números no cierran (probable error de OCR, no redondeo). */
  importeDescuadra: boolean;
};

export type LacrozeMeta = {
  factura: string | null;
  fecha: string | null;
  cae: string | null;
  totalFactura: number | null;
};

export type LacrozeParseResult = {
  meta: LacrozeMeta;
  lines: LacrozeLine[];
  totalCalculado: number;
  warnings: string[];
};

// Formato FACTURA: codigo(4-6) | desc | cantidad | UN | precio | importe
const FACTURA_RE = /^(\d{4,6})\s+(.+?)\s+(\d+)\s+UN\s+([\d.,]+)\s+([\d.,]+)$/;
// Formato PEDIDO: codigo(5-9) | desc | cantidad | precio | importe  (sin UN)
// La cantidad acepta caracteres que el OCR confunde con dígitos (l I | :),
// que después normalizamos con fixOcrQty. Ej: el "1" se lee a veces como ":".
const PEDIDO_RE = /^(\d{5,9})\s+(.+?)\s+([\dlI|:]+)\s+([\d.,]+)\s+([\d.,]+)$/;

function parseNum(raw: string): number {
  const s = raw.trim();
  if (s.includes(".") && s.includes(",")) {
    return Number(s.replace(/\./g, "").replace(",", "."));
  }
  if (s.includes(",") && !s.includes(".")) {
    return Number(s.replace(",", "."));
  }
  return Number(s);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Normaliza la cantidad leída por OCR: l/I/| y : se confunden con dígitos.
 * Devuelve el entero, o NaN si no queda un número válido.
 */
function fixOcrQty(raw: string): number {
  const cleaned = raw.replace(/[lI|:]/g, "1");
  return /^\d+$/.test(cleaned) ? parseInt(cleaned, 10) : NaN;
}

/**
 * Parsea líneas de texto (vengan del PDF o del OCR) a ítems de compra.
 * Filtra las líneas "Envase: ..." y prueba los dos formatos por línea.
 */
export function parseLacrozeLines(rawLines: string[]): LacrozeParseResult {
  const fullText = rawLines.join("\n");
  const warnings: string[] = [];
  const lines: LacrozeLine[] = [];

  for (const raw of rawLines) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;
    // Envase / gotero: parte del producto, no un ítem. Se ignora.
    if (/^envase\b/i.test(line)) continue;

    // 1) Factura (con UN, precio exacto).
    const mf = FACTURA_RE.exec(line);
    if (mf) {
      const [, codigo, descripcion, cantStr, precioStr, importeStr] = mf;
      const cantidad = parseInt(cantStr, 10);
      const precioUnit = parseNum(precioStr);
      const importe = parseNum(importeStr);
      const descuadra =
        Math.abs(round2(cantidad * precioUnit) - round2(importe)) > 0.01;
      if (descuadra) {
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
        importeDescuadra: descuadra,
      });
      continue;
    }

    // 2) Pedido (sin UN, precio redondeado -> costo real = importe/cantidad).
    const mp = PEDIDO_RE.exec(line);
    if (mp) {
      const [, codigo, descripcion, cantStr, precioStr, importeStr] = mp;
      const cantidad = fixOcrQty(cantStr);
      if (!Number.isFinite(cantidad) || cantidad < 1) continue;
      const precioMostrado = parseNum(precioStr);
      const importe = parseNum(importeStr);
      // Costo real por unidad: el importe es la fuente de verdad; el precio
      // que se ve viene redondeado. cantidad * precio_mostrado ~= importe.
      const precioUnit = cantidad > 0 ? round2(importe / cantidad) : precioMostrado;
      // Descuadre solo si es GRANDE (>5%): eso es error de OCR, no redondeo.
      const rel = importe > 0
        ? Math.abs(cantidad * precioMostrado - importe) / importe
        : 0;
      const descuadra = rel > 0.05;
      if (descuadra) {
        warnings.push(
          `"${descripcion.trim()}": ${cantidad} x ${precioMostrado} no da ${importe} (posible error de OCR).`
        );
      }
      lines.push({
        codigo,
        descripcion: descripcion.trim(),
        cantidad,
        precioUnit,
        importe,
        importeDescuadra: descuadra,
      });
      continue;
    }
    // No matchea ningun formato -> se ignora (encabezados, totales, etc.).
  }

  // Metadata (solo la factura la trae; en el pedido queda null, no molesta).
  const factura =
    /(?:FACTURA|PEDIDOS?)\s*N[º°o]?\s*([\d-]+)/i.exec(fullText)?.[1] ?? null;
  const fecha = /(\d{2}\/\d{2}\/\d{4})/.exec(fullText)?.[1] ?? null;
  const cae = /CAE\s*N[º°o]?\s*:?\s*(\d{6,})/i.exec(fullText)?.[1] ?? null;
  const totalMatch = /\$\s*([\d.,]+)/.exec(fullText);
  const totalFactura = totalMatch ? parseNum(totalMatch[1]) : null;

  const totalCalculado = round2(
    lines.reduce((acc, l) => acc + l.cantidad * l.precioUnit, 0)
  );

  if (lines.length === 0) {
    warnings.push(
      "No se detecto ninguna linea de producto. Revisa que la foto/PDF sea legible."
    );
  }
  if (totalFactura != null && Math.abs(totalFactura - totalCalculado) > 1) {
    warnings.push(
      `El total del documento (${totalFactura}) no coincide con la suma de las lineas (${totalCalculado}). Revisa cantidades y costos.`
    );
  }

  return { meta: { factura, fecha, cae, totalFactura }, lines, totalCalculado, warnings };
}

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