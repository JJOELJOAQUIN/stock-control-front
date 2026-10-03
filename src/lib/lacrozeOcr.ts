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
  const input = await preprocessForOcr(file).catch(() => file);
  const { data } = await Tesseract.recognize(input, "spa", {
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

/**
 * Prepara la imagen para el OCR:
 *  - la agranda x2 (Tesseract lee mucho mejor los números chicos), y
 *  - la pasa a blanco y negro usando el canal MÁS OSCURO de cada pixel.
 *
 * Lo segundo es clave para el pedido de Lacroze: los precios están en ROJO
 * sobre fondo rosado, y en escala de grises normal quedan como gris medio que
 * Tesseract lee mal ("8" -> "El", "4" -> "a", "8410" -> "sa10"). Con el canal
 * mínimo, el rojo (G y B bajos) queda negro y el fondo claro queda blanco.
 */
async function preprocessForOcr(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = bitmap.width < 2000 ? 2 : 1;
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return file;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.min(d[i], d[i + 1], d[i + 2]) < 150 ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/png")
  );
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