// core/auth/roles.ts
// Fuente canónica de roles de la app.
// Evita duplicar el union type en AuthProvider, app-user.ts, etc.

export type AppRole = "ADMIN" | "USER" | "COSMETOLOGA" | "PENDING";

export const ROLES: AppRole[] = ["ADMIN", "USER", "COSMETOLOGA", "PENDING"];

/** True si `userRoles` contiene al menos uno de `allowed`. */
export function hasAnyRole(userRoles: string[], allowed: AppRole[]): boolean {
  return userRoles.some((r) => (allowed as string[]).includes(r));
}