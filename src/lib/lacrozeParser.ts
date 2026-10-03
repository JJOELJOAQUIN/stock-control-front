/**
 * Parser de compras de Farmacia Magistral Lacroze (sin dependencias de PDF/OCR,
 * para poder testearlo y reusarlo desde los dos extractores).
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
 *     El total viene suelto al pie (sin "$" ni la palabra TOTAL).
 *
 * En los dos casos el match contra el catálogo se hace por DESCRIPCIÓN: el
 * "código" es de familia, no identifica el producto.
 *
 * Si el OCR rompe algún número de un renglón (típico con los números en rojo:
 * "8" -> "El", "4" -> "a", "8410" -> "sa10"), el renglón NO se descarta: se
 * rescata con lo que se pueda deducir (cantidad = importe / precio, o importe
 * = total del pedido - resto de líneas) y se marca para revisar.
 */

export type LacrozeLine = {
  codigo: string;
  descripcion: string;
  cantidad: number;
  /** Costo unitario. En pedido = importe/cantidad (real, no el redondeado). */
  precioUnit: number;
  importe: number;
  /** true si los números no cierran o hubo que deducirlos (revisar a mano). */
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
// Renglón de producto con números ilegibles: código + texto, y al menos un
// dígito en el último token (para no agarrar encabezados ni texto suelto).
const RESCUE_RE = /^(\d{5,9})\s+(.+\S*\d\S*)$/;
// Total suelto al pie del pedido: una línea que es solo un número.
const BARE_NUMBER_RE = /^\$?\s*([\d.,]{4,})$/;
// Tolerancia para considerar que cantidad x precio "cierra" con el importe.
const REL_TOLERANCE = 0.05;

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

/** Número solo si el token es 100% numérico; si no, NaN. */
function strictNum(raw: string): number {
  return /^\d[\d.,]*$/.test(raw) ? parseNum(raw) : NaN;
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

function relDiff(a: number, b: number): number {
  return b > 0 ? Math.abs(a - b) / b : 0;
}

type RescuedLine = LacrozeLine & {
  /** El importe no se pudo leer (candidato a deducirse del total). */
  importeDesconocido: boolean;
};

/**
 * Intenta rescatar un renglón de producto donde el OCR rompió cantidad,
 * precio y/o importe. Toma los últimos 3 tokens como CANT PRECIO IMPORTE y
 * deduce lo que falte. Devuelve null si no parece un renglón de producto.
 */
function rescueLine(line: string): RescuedLine | null {
  const m = RESCUE_RE.exec(line);
  if (!m) return null;
  const [, codigo, rest] = m;
  const tokens = rest.split(" ");
  // Necesitamos al menos 1 palabra de descripción + 3 tokens numéricos.
  if (tokens.length < 4) return null;

  const [rawQtyTok, precioTok, importeTok] = tokens.slice(-3);
  let qtyTok = rawQtyTok;
  let descTokens = tokens.slice(0, -3);
  // Un token largo con letras en la posición de la cantidad (ej. "250CC") es
  // parte de la descripción: el OCR se comió la cantidad.
  if (qtyTok.length > 3 && /[A-Z]/i.test(qtyTok)) {
    descTokens = [...descTokens, qtyTok];
    qtyTok = "";
  }
  const descripcion = descTokens.join(" ").trim();
  if (!/[A-Z]{3,}/i.test(descripcion)) return null;

  let cantidad = qtyTok ? fixOcrQty(qtyTok) : NaN;
  let precio = strictNum(precioTok);
  let importe = strictNum(importeTok);
  if (!Number.isFinite(cantidad) || cantidad < 1) cantidad = NaN;

  // Cantidad ilegible: si precio e importe se leyeron, cantidad = importe/precio.
  if (Number.isNaN(cantidad) && precio > 0 && importe > 0) {
    const q = Math.round(importe / precio);
    if (q >= 1 && relDiff(q * precio, importe) <= REL_TOLERANCE) cantidad = q;
  }
  // Importe ilegible: cantidad x precio.
  if (Number.isNaN(importe) && cantidad >= 1 && precio > 0) {
    importe = round2(cantidad * precio);
  }
  // Precio ilegible: importe / cantidad.
  if (Number.isNaN(precio) && cantidad >= 1 && importe > 0) {
    precio = round2(importe / cantidad);
  }

  const importeDesconocido = !(importe > 0);
  const qty = cantidad >= 1 ? cantidad : 1;
  const precioUnit = importe > 0 ? round2(importe / qty) : precio > 0 ? precio : 0;

  return {
    codigo,
    descripcion,
    cantidad: qty,
    precioUnit,
    importe: importe > 0 ? importe : 0,
    importeDescuadra: true,
    importeDesconocido,
  };
}

/**
 * Busca el total del documento: "$ 123.456" (factura) o, en el pedido, un
 * número suelto en su propia línea después del último producto.
 */
function findTotal(rawLines: string[], lastProductIdx: number): number | null {
  const fullText = rawLines.join("\n");
  const withPeso = /\$\s*([\d.,]+)/.exec(fullText);
  if (withPeso) return parseNum(withPeso[1]);

  for (let i = rawLines.length - 1; i > lastProductIdx; i--) {
    const mb = BARE_NUMBER_RE.exec(rawLines[i].replace(/\s+/g, " ").trim());
    if (mb) {
      const n = parseNum(mb[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

/**
 * Parsea líneas de texto (vengan del PDF o del OCR) a ítems de compra.
 * Filtra las líneas "Envase: ..." y prueba los dos formatos por línea.
 */
export function parseLacrozeLines(rawLines: string[]): LacrozeParseResult {
  const fullText = rawLines.join("\n");
  const warnings: string[] = [];
  const lines: RescuedLine[] = [];
  let lastProductIdx = -1;

  rawLines.forEach((raw, idx) => {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) return;
    // Envase / gotero: parte del producto, no un ítem. Se ignora.
    if (/^envase\b/i.test(line)) return;

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
        importeDesconocido: false,
      });
      lastProductIdx = idx;
      return;
    }

    // 2) Pedido (sin UN, precio redondeado -> costo real = importe/cantidad).
    const mp = PEDIDO_RE.exec(line);
    if (mp) {
      const [, codigo, descripcion, cantStr, precioStr, importeStr] = mp;
      const cantidad = fixOcrQty(cantStr);
      if (Number.isFinite(cantidad) && cantidad >= 1) {
        const precioMostrado = parseNum(precioStr);
        const importe = parseNum(importeStr);
        // Costo real por unidad: el importe es la fuente de verdad; el precio
        // que se ve viene redondeado. cantidad * precio_mostrado ~= importe.
        const precioUnit = round2(importe / cantidad);
        // Descuadre solo si es GRANDE (>5%): eso es error de OCR, no redondeo.
        const descuadra =
          relDiff(cantidad * precioMostrado, importe) > REL_TOLERANCE;
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
          importeDesconocido: false,
        });
        lastProductIdx = idx;
        return;
      }
    }

    // 3) Renglón de producto con números rotos por el OCR: rescatarlo.
    const rescued = rescueLine(line);
    if (rescued) {
      lines.push(rescued);
      lastProductIdx = idx;
    }
    // No matchea ningun formato -> se ignora (encabezados, totales, etc.).
  });

  // Metadata (la factura trae todo; el pedido trae número, fecha y total).
  const factura =
    /(?:FACTURA|PEDIDOS?)\s*N\S?\s*([\d-]+)/i.exec(fullText)?.[1] ?? null;
  const fecha = /(\d{2}\/\d{2}\/\d{4})/.exec(fullText)?.[1] ?? null;
  const cae = /CAE\s*N[º°o]?\s*:?\s*(\d{6,})/i.exec(fullText)?.[1] ?? null;
  const totalFactura = findTotal(rawLines, lastProductIdx);

  // Si un solo renglón quedó sin importe y conocemos el total, lo deducimos.
  const unknown = lines.filter((l) => l.importeDesconocido);
  if (totalFactura != null && unknown.length === 1) {
    const target = unknown[0];
    const resto = lines
      .filter((l) => l !== target)
      .reduce((acc, l) => acc + l.importe, 0);
    const deducido = round2(totalFactura - resto);
    if (deducido > 0) {
      target.importe = deducido;
      target.precioUnit = round2(deducido / target.cantidad);
      target.importeDesconocido = false;
    }
  }

  for (const l of lines) {
    if (l.importeDesconocido) {
      warnings.push(
        `"${l.descripcion}": no se pudo leer cantidad/costo. Completalos a mano.`
      );
    } else if (l.importeDescuadra && !warnings.some((w) => w.startsWith(`"${l.descripcion}"`))) {
      warnings.push(
        `"${l.descripcion}": números deducidos (OCR ilegible). Revisá cantidad y costo.`
      );
    }
  }

  const finalLines: LacrozeLine[] = lines.map((l) => ({
    codigo: l.codigo,
    descripcion: l.descripcion,
    cantidad: l.cantidad,
    precioUnit: l.precioUnit,
    importe: l.importe,
    importeDescuadra: l.importeDescuadra,
  }));

  const totalCalculado = round2(
    finalLines.reduce((acc, l) => acc + l.cantidad * l.precioUnit, 0)
  );

  if (finalLines.length === 0) {
    warnings.push(
      "No se detecto ninguna linea de producto. Revisa que la foto/PDF sea legible."
    );
  }
  if (totalFactura != null && Math.abs(totalFactura - totalCalculado) > 1) {
    warnings.push(
      `El total del documento (${totalFactura}) no coincide con la suma de las lineas (${totalCalculado}). Revisa cantidades y costos.`
    );
  }

  return { meta: { factura, fecha, cae, totalFactura }, lines: finalLines, totalCalculado, warnings };
}
