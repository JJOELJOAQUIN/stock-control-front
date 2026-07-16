import { useMemo } from "react";

import { useRoles } from "@/features/auth/hooks/useRoles";
import { hasAnyRole } from "@/features/auth/role";
import type { CashActor } from "@/features/caja/types/cash.types";

type Performer = {
  /** Quién se asume que está haciendo la venta, según el rol logueado. */
  actor: CashActor;
  /**
   * True cuando el rol no puede registrar ventas a nombre de otra persona.
   * La COSMETOLOGA sólo puede vender como ella misma; la médica (ADMIN/USER)
   * opera el sistema todo el día y a veces carga ventas que hizo Gise.
   */
  locked: boolean;
  /** Texto para mostrar dónde antes había un select. */
  label: string;
};

const LABELS: Record<CashActor, string> = {
  MEDICA: "Médica",
  COSMETOLOGA: "Cosmetóloga",
};

/**
 * Resuelve automáticamente quién realiza la venta a partir del rol logueado,
 * para no hacer elegir en cada venta algo que el sistema ya sabe.
 *
 * Por qué NO se bloquea para la médica: Pili es quien opera el sistema, y
 * registrar una venta que hizo Gise es un caso real. Si el selector
 * desapareciera para ella, esa venta se guardaría como 100% médica en lugar
 * de 5/95 y Gise perdería su parte sin que nadie lo note. El default le
 * ahorra el clic en el caso normal; el override existe para el caso raro.
 *
 * Para la cosmetóloga sí se bloquea: no tiene ningún motivo legítimo para
 * registrar una venta a nombre de la médica, y dejarlo abierto sería darle
 * la posibilidad de moverse plata de un lado al otro.
 */
export function usePerformer(): Performer {
  const roles = useRoles();

  return useMemo(() => {
    if (hasAnyRole(roles, ["COSMETOLOGA"])) {
      return {
        actor: "COSMETOLOGA" as CashActor,
        locked: true,
        label: LABELS.COSMETOLOGA,
      };
    }

    return {
      actor: "MEDICA" as CashActor,
      locked: false,
      label: LABELS.MEDICA,
    };
  }, [roles]);
}

export function performerLabel(actor: CashActor): string {
  return LABELS[actor] ?? actor;
}