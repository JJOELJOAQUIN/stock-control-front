import type { CashActor } from "@/features/caja/types/cash.types";

/**
 * Catálogo de tratamientos con recetario de consumo (BOM).
 *
 * Cada línea es una PLANTILLA, no un vínculo duro a un producto: `hint` se
 * usa para pre-seleccionar el producto del stock cuyo nombre lo contenga, y
 * quien registra confirma o corrige. Así el catálogo no depende de UUIDs de
 * la base y sobrevive a renombres.
 *
 * Cantidades en la unidad consumible (ml, ampollas, disparos, unidades).
 * El stock se lleva en ENTEROS: si un consumo real fue medio ml (ej. 0,5 de
 * cada vial de Oxiblock), registrá el total combinado (0,5 + 0,5 = 1 ml).
 *
 * Fuentes: Manual Interno de Consumo (jun 2026) y detalle de Gise (21/7).
 */

export type BomTemplateLine = {
  hint: string;
  label: string;
  quantity: number;
  unit: "ml" | "ampolla" | "disparo" | "unidad" | "vial";
  note?: string;
};

export type DermatoProcedure = {
  code: string;
  label: string;
  kind: "medica" | "cosmetologia";
  /** Precio de lista; 0 = siempre se carga a mano. */
  amount: number;
  bom: BomTemplateLine[];
};

/** Reparto según quién hace el tratamiento. */
export function splitFor(kind: DermatoProcedure["kind"]): {
  doctorSharePercent: number;
  cosmetologistSharePercent: number;
  performedBy: CashActor;
} {
  return kind === "cosmetologia"
    ? { doctorSharePercent: 0.3, cosmetologistSharePercent: 0.7, performedBy: "COSMETOLOGA" }
    : { doctorSharePercent: 1, cosmetologistSharePercent: 0, performedBy: "MEDICA" };
}

export const DERMATO_PROCEDURES: DermatoProcedure[] = [
  // ───────────── Dermatológicos (Pili, 100% médica) ─────────────
  {
    code: "PRP_CAPILAR",
    label: "PRP CAPILAR",
    kind: "medica",
    amount: 65000,
    bom: [
      { hint: "tubo", label: "Tubos al vacío PRP", quantity: 2, unit: "unidad" },
      { hint: "mariposa", label: "Mariposa (Butterfly)", quantity: 1, unit: "unidad" },
    ],
  },
  {
    code: "PRP_FACIAL",
    label: "PRP FACIAL",
    kind: "medica",
    amount: 85000,
    bom: [
      { hint: "tubo", label: "Tubos al vacío PRP", quantity: 4, unit: "unidad", note: "3 a 4 según paciente" },
      { hint: "mariposa", label: "Mariposa (Butterfly)", quantity: 1, unit: "unidad" },
      { hint: "anest", label: "Crema anestésica", quantity: 1, unit: "unidad", note: "si corresponde" },
    ],
  },
  {
    code: "PRP_DERMAPEN_ACNE",
    label: "PRP + DERMAPEN MÉDICO CICATRICES ACNE",
    kind: "medica",
    amount: 130000,
    bom: [
      { hint: "tubo", label: "Tubos al vacío PRP", quantity: 4, unit: "unidad" },
      { hint: "mariposa", label: "Mariposa (Butterfly)", quantity: 1, unit: "unidad" },
      { hint: "anest", label: "Crema anestésica", quantity: 1, unit: "unidad", note: "si corresponde" },
      { hint: "cartucho", label: "Cartucho Dermapen N°9/N°12", quantity: 1, unit: "unidad" },
    ],
  },
  {
    code: "MESOTERAPIA_CAPILAR",
    label: "MESOTERAPIA CAPILAR",
    kind: "medica",
    amount: 58000,
    bom: [
      {
        hint: "minoxidil",
        label: "Ampolla capilar (elegir cuál se usó)",
        quantity: 1,
        unit: "ml",
        note: "1 a 2 cc: finasteride / minoxidil / dutasteride / ác. retinoico / biotina",
      },
    ],
  },
  {
    code: "OJERAS_NCTF",
    label: "OJERAS NCTF",
    kind: "medica",
    amount: 185000,
    bom: [{ hint: "nctf", label: "NCTF", quantity: 1, unit: "ml", note: "1 cc habitual, 2 en algunos" }],
  },
  {
    code: "REDENX",
    label: "REDENX",
    kind: "medica",
    amount: 0,
    bom: [
      { hint: "redenx", label: "Redenx", quantity: 3, unit: "ml", note: "mide siempre ml" },
      { hint: "dmae", label: "Ampolla DMAE", quantity: 1, unit: "ampolla", note: "Redenx SIEMPRE lleva DMAE" },
    ],
  },
  {
    code: "MESOTERAPIA_DESPIGMENTANTE",
    label: "MESOTERAPIA DESPIGMENTANTE",
    kind: "medica",
    amount: 0,
    bom: [{ hint: "depigment", label: "Depigmentation Solution", quantity: 1, unit: "ml", note: "1 a 2 ml" }],
  },
  {
    code: "MESOTERAPIA_VITAMINA_C",
    label: "MESOTERAPIA CON VITAMINA C",
    kind: "medica",
    amount: 0,
    bom: [{ hint: "vitamin", label: "Vitamina C", quantity: 1, unit: "vial", note: "vial completo" }],
  },
  {
    code: "MESOTERAPIA_DMAE",
    label: "MESOTERAPIA CON DMAE",
    kind: "medica",
    amount: 0,
    bom: [{ hint: "dmae", label: "DMAE", quantity: 1, unit: "ampolla", note: "un solo uso" }],
  },
  {
    code: "MESOTERAPIA_OLIGOELEMENTOS",
    label: "MESOTERAPIA CON OLIGOELEMENTOS",
    kind: "medica",
    amount: 0,
    bom: [{ hint: "oligo", label: "Oligoelementos", quantity: 1, unit: "vial", note: "vial completo" }],
  },
  {
    code: "MELILOT",
    label: "MELILOT",
    kind: "medica",
    amount: 0,
    bom: [{ hint: "melilot", label: "Melilot", quantity: 1, unit: "vial", note: "vial completo" }],
  },
  {
    code: "SKIN_MARK",
    label: "SKIN MARK REACTIVACIÓN",
    kind: "medica",
    amount: 0,
    bom: [
      { hint: "skinmark", label: "SkinMark Solution", quantity: 1, unit: "vial", note: "frasco entero" },
      { hint: "cartucho", label: "Cartucho Dermapen", quantity: 1, unit: "unidad" },
    ],
  },
  {
    code: "FRAX_FACE_DERMATOLOGICO",
    label: "FRAX FACE DERMATOLÓGICO",
    kind: "medica",
    amount: 170000,
    bom: [
      { hint: "frax", label: "Pin Frax (disparos)", quantity: 40, unit: "disparo", note: "cargar los disparos reales" },
    ],
  },

  // ───────────── Cosmetológicos (Gise, 30/70) ─────────────
  // Los codes coinciden con el catálogo de caja (DERMAPEN, HYDRA, EXOSOMAS)
  // para que la historia agregue junta.
  {
    code: "DERMAPEN",
    label: "DERMAPEN (COSMETOLÓGICO)",
    kind: "cosmetologia",
    amount: 47500,
    bom: [
      { hint: "aguja", label: "Micro aguja 24/36", quantity: 1, unit: "unidad", note: "la que haya" },
      { hint: "hialur", label: "Dermassy Ác. Hialurónico", quantity: 1, unit: "ml", note: "3 ml de activos EN TOTAL, combinados" },
      { hint: "argerilox", label: "Dermassy Argerilox", quantity: 1, unit: "ml", note: "ajustar/borrar según combinación" },
      { hint: "antiox", label: "Dermassy Blend Antioxidante", quantity: 1, unit: "ml", note: "ajustar/borrar; alt: Blend Aclarante" },
    ],
  },
  {
    code: "HYDRA",
    label: "HYDRA LIPS",
    kind: "cosmetologia",
    amount: 19000,
    bom: [
      { hint: "aguja", label: "Micro aguja 24/36", quantity: 1, unit: "unidad" },
      { hint: "hialur", label: "Dermassy Ác. Hialurónico", quantity: 1, unit: "ml" },
    ],
  },
  {
    code: "EXOSOMAS",
    label: "EXOSOMAS",
    kind: "cosmetologia",
    amount: 65000,
    bom: [
      { hint: "aguja", label: "Micro aguja 24/36", quantity: 1, unit: "unidad" },
      { hint: "exosoma", label: "Exosomas U-derm", quantity: 2, unit: "ml", note: "1 ml de cada vial, siempre juntos" },
      { hint: "oxiblock", label: "U-derm Drops Oxiblock", quantity: 1, unit: "ml", note: "opcional; si fue 0,5+0,5 registrá 1; si no se usó, borrá la línea" },
    ],
  },
];