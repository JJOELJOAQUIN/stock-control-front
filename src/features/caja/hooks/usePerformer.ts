import { useMemo } from "react";

import { useRoles } from "@/features/auth/hooks/useRoles";
import { hasAnyRole } from "@/features/auth/role";
import type { CashActor } from "@/features/caja/types/cash.types";

type Performer = {
  /** Quién se asume que está haciendo la venta, según el rol logueado. */
  actor: CashActor;
  /**
   * True cuando el rol no puede registrar ventas a nombre de otra persona.
   * Hoy nadie está bloqueado (ver abajo), pero el mecanismo queda: los
   * diálogos ya saben renderizar un rol bloqueado, y volver a bloquear es
   * cambiar un booleano acá.
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
 * Resuelve quién realiza la venta a partir del rol logueado, como DEFAULT:
 * la cosmetóloga arranca en COSMETOLOGA, la médica en MEDICA, y las dos
 * pueden cambiarlo antes de confirmar.
 *
 * Antes la cosmetóloga estaba bloqueada (no podía elegir MEDICA). Se
 * destrabó a pedido de Joel: el caso espejo también existe — Gise a veces
 * registra una venta que hizo Pili, y con el selector bloqueado esa venta
 * quedaba 5/95 en lugar de 100% médica. El costo de destrabarlo es que ya
 * no hay nada que impida registrar a nombre de la otra; el default correcto
 * hace que el caso normal siga siendo cero clics.
 */
export function usePerformer(): Performer {
  const roles = useRoles();

  return useMemo(() => {
    if (hasAnyRole(roles, ["COSMETOLOGA"])) {
      return {
        actor: "COSMETOLOGA" as CashActor,
        locked: false,
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