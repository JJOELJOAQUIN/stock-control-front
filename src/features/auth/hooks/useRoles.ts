// core/auth/hooks/useRoles.ts
import { useAuth } from "@/core/auth/context/AuthProvider";
import { hasAnyRole, type AppRole } from "../role";


/** Devuelve los roles del usuario autenticado. */
export function useRoles(): string[] {
  const { authState } = useAuth();
  return authState.roles;
}

/** True si el usuario tiene al menos uno de los roles indicados. */
export function useHasRole(allowed: AppRole[]): boolean {
  const roles = useRoles();
  return hasAnyRole(roles, allowed);
}