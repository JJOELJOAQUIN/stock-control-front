import { useMemo } from "react";

import {
  COSMETOLOGIA_PROCEDURES,
  MEDICA_PROCEDURES,
  type CashActor,
  type ProcedureOption,
} from "@/features/caja/types/cash.types";
import { useGetProcedureCatalogQuery, type ProcedureCatalogItem } from "@/features/treatments/ui/screens/api/procedureCatalogApi";


export type ProcedureShares = {
  performedBy: CashActor;
  doctorSharePercent: number;
  cosmetologistSharePercent: number;
};

type OptionWithKind = ProcedureOption & { kind: "MEDICA" | "COSMETOLOGIA" };

// Fallback histórico (mismo criterio que el backend). Se usa sólo para códigos
// que todavía no estén en el catálogo: apenas la tabla está sembrada, manda ella.
const FIFTY_FIFTY_CODES = new Set(["FRAX_LIMPIEZA_PROFUNDA", "FRAX_EXOSOMAS_LIMPIEZA"]);
const COSMO_CONST_CODES = new Set(COSMETOLOGIA_PROCEDURES.map((p) => p.code));

function fallbackShares(code: string): ProcedureShares {
  if (FIFTY_FIFTY_CODES.has(code)) {
    return { performedBy: "COSMETOLOGA", doctorSharePercent: 0.5, cosmetologistSharePercent: 0.5 };
  }
  if (COSMO_CONST_CODES.has(code)) {
    return { performedBy: "COSMETOLOGA", doctorSharePercent: 0.3, cosmetologistSharePercent: 0.7 };
  }
  return { performedBy: "MEDICA", doctorSharePercent: 1, cosmetologistSharePercent: 0 };
}

/**
 * Fuente única de los procedimientos que se ofrecen en caja. Combina el
 * catálogo del backend (procedure_catalog) con las listas hardcodeadas como
 * fallback, así:
 *  - si el catálogo está vacío o cargando, todo sigue andando con las constantes;
 *  - los tratamientos que la Dra crea en el ABM aparecen solos en los selectores;
 *  - el catálogo pisa a la constante cuando comparten código (label/precio/reparto).
 *
 * El reparto real lo resuelve igual el backend; `sharesFor` es para que la UI
 * muestre y mande lo correcto (incluidos los códigos nuevos del catálogo).
 */
export function useProcedureOptions() {
  const { data, isLoading } = useGetProcedureCatalogQuery({ includeInactive: false });

  return useMemo(() => {
    const catalog: ProcedureCatalogItem[] = data ?? [];
    const catalogByCode = new Map(catalog.map((c) => [c.code, c]));

    // Semilla: constantes. Overlay: catálogo (gana el catálogo por código).
    const merged = new Map<string, OptionWithKind>();
    for (const p of MEDICA_PROCEDURES) merged.set(p.code, { ...p, kind: "MEDICA" });
    for (const p of COSMETOLOGIA_PROCEDURES) merged.set(p.code, { ...p, kind: "COSMETOLOGIA" });
    for (const c of catalog) {
      merged.set(c.code, {
        code: c.code,
        label: c.label,
        amount: c.amount ?? 0,
        kind: c.kind,
      });
    }

    const all: OptionWithKind[] = Array.from(merged.values());
    const toOption = ({ code, label, amount }: OptionWithKind): ProcedureOption => ({
      code,
      label,
      amount,
    });

    const sharesFor = (code: string): ProcedureShares => {
      const c = catalogByCode.get(code);
      if (c) {
        return {
          performedBy: c.performer,
          doctorSharePercent: c.doctorPercent,
          cosmetologistSharePercent: c.cosmetologistPercent,
        };
      }
      return fallbackShares(code);
    };

    return {
      all: all.map(toOption),
      medica: all.filter((p) => p.kind === "MEDICA").map(toOption),
      cosmetologia: all.filter((p) => p.kind === "COSMETOLOGIA").map(toOption),
      sharesFor,
      isLoading,
    };
  }, [data, isLoading]);
}