// shared/navigation/nav-items.ts
import type { AppRole } from "@/features/auth/role";
import {
  HomeIcon,
  Package,
  Wallet,
  Receipt,
  User2,
  Home as HomeMobileIcon,
  DollarSign,
  Activity,
  Users as UsersMobileIcon,
  type LucideIcon,
} from "lucide-react";


export interface NavItem {
  href: string;
  /** Roles que ven el ítem. `undefined` => visible para TODOS los autenticados. */
  roles?: AppRole[];

  // Presentación desktop (sidebar)
  label: string;
  icon: LucideIcon;

  // Presentación mobile (bottom nav). Si no se setean, usan los de desktop.
  mobileLabel?: string;
  mobileIcon?: LucideIcon;
  /** Si es false, no aparece en el bottom nav mobile. Default: true. */
  showInMobile?: boolean;

  submenu?: NavItem[];
}

/**
 * FUENTE ÚNICA de navegación. Desktop (sidebar) y mobile (bottom nav) derivan de acá.
 * La visibilidad por rol vive SOLO en este archivo => sin drift entre layouts.
 *
 * Matriz actual:
 *  - COSMETOLOGA ve: Home, Stock, Caja
 *  - Se le ocultan: Movimientos Consultorio, Usuarios
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/inicio",
    label: "Home",
    icon: HomeIcon,
    mobileLabel: "Inicio",
    mobileIcon: HomeMobileIcon,
  },
  {
    href: "/inicio/stock",
    label: "Stock",
    icon: Package,
    mobileLabel: "Stock",
  },
  {
    href: "/inicio/caja/consultorio",
    label: "Caja",
    icon: Wallet,
    mobileLabel: "Caja",
    mobileIcon: DollarSign,
  },
  {
    href: "/inicio/movimientos-consultorio",
    label: "Movimientos Consultorio",
    icon: Receipt,
    mobileLabel: "Mov.",
    mobileIcon: Activity,
    roles: ["ADMIN", "USER"], // oculto para COSMETOLOGA
  },
  {
    href: "/inicio/usuarios",
    label: "Usuarios",
    icon: User2,
    mobileLabel: "Usuarios",
    mobileIcon: UsersMobileIcon,
    // Oculto para COSMETOLOGA. El endpoint del back ya es hasRole('ADMIN');
    // si querés que tampoco lo vea USER, dejá solo ["ADMIN"].
    roles: ["ADMIN", "USER"],
  },
];

/** Filtra la navegación según los roles del usuario (recursivo para submenús). */
export function filterNavByRoles(
  items: NavItem[],
  userRoles: string[]
): NavItem[] {
  return items
    .filter((item) => !item.roles || item.roles.some((r) => userRoles.includes(r)))
    .map((item) =>
      item.submenu
        ? { ...item, submenu: filterNavByRoles(item.submenu, userRoles) }
        : item
    );
}