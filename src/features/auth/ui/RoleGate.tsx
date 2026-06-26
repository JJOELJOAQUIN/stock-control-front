// core/auth/ui/RoleGate.tsx
import { type ReactNode } from "react";
import type { AppRole } from "../role";
import { useHasRole } from "../hooks/useRoles";



interface Props {
  /** Roles que pueden ver el contenido. */
  allow: AppRole[];
  /** Qué renderizar si NO tiene permiso. Por defecto: nada. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Oculta cualquier bloque de UI según rol, de forma declarativa.
 *
 *   <RoleGate allow={["ADMIN", "USER"]}>
 *     <BotonSensible />
 *   </RoleGate>
 *
 * Con fallback:
 *   <RoleGate allow={["ADMIN"]} fallback={<SinPermiso />}>
 *     <PanelAdmin />
 *   </RoleGate>
 */
export function RoleGate({ allow, fallback = null, children }: Props) {
  const allowed = useHasRole(allow);
  return <>{allowed ? children : fallback}</>;
}