import Tesseract from "tesseract.js";

/**
 * Extrae líneas de texto de una imagen (JPG/PNG) del pedido de Lacroze usando
 * OCR (Tesseract.js, en el navegador).
 *
 * OJO: el OCR de tablas con números NO es 100% confiable — puede leer un 7
 * como 1, etc. Por eso el flujo SIEMPRE muestra preview editable antes de
 * confirmar: acá extraemos lo mejor posible, y la corrección final la hace la
 * persona revisando. La consistencia (cantidad × precio ≈ importe) se valida
 * en el parser para resaltar los renglones sospechosos.
 *
 * La primera vez que se usa, Tesseract descarga el modelo de idioma (~unos MB)
 * desde su CDN; puede tardar unos segundos. Después queda cacheado.
 *
 * @param onProgress callback opcional 0..1 para mostrar una barra de progreso.
 */
export async function extractLinesFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const { data } = await Tesseract.recognize(file, "spa", {
    logger: (m: { status?: string; progress?: number }) => {
      if (onProgress && m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress(m.progress);
      }
    },
  });

  // data.text viene con saltos de línea; devolvemos línea por línea, limpio.
  return data.text
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);
}

/** true si el archivo es una imagen (por tipo MIME o extensión). */
export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|bmp)$/i.test(file.name);
}

/** true si el archivo es un PDF. */
export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}