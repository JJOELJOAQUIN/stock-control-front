// shared/navigation/nav-items.ts
import type { AppRole } from "@/features/auth/role";
import {
  HomeIcon,
  Package,
  Wallet,
  Receipt,
  Stethoscope,
  Home as HomeMobileIcon,
  DollarSign,
  Activity,
  AlertTriangle,
  BookOpen,
  Barcode,
  Droplets,
  TrendingUp,
  ShoppingCart,
  ShoppingBag,
  Tag,
  Store,
  Layers,
  Syringe,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** Roles que ven el item. `undefined` => visible para TODOS los autenticados. */
  roles?: AppRole[];

  // Presentacion desktop (sidebar)
  label: string;
  icon: LucideIcon;

  // Presentacion mobile (bottom nav). Si no se setean, usan los de desktop.
  mobileLabel?: string;
  mobileIcon?: LucideIcon;
  /** Si es false, no aparece en el bottom nav mobile. Default: true. */
  showInMobile?: boolean;

  submenu?: NavItem[];
}

/**
 * FUENTE UNICA de navegacion. Desktop (sidebar) y mobile (bottom nav) derivan
 * de aca. La visibilidad por rol vive SOLO en este archivo.
 *
 * Reordenamiento jul-2026: cada seccion agrupa lo suyo con submenus.
 *  - Stock: inventario y consumos (sin ventas).
 *  - Caja: toda la plata (ventas, compras, metricas, movimientos).
 *  - Tratamientos: peeling, procedimientos y mesoterapias.
 *  - Usuarios: oculto del menu; la ruta sigue viva por URL para ADMIN.
 *
 * Los submenus NO van al bottom nav mobile (showInMobile: false): ahi solo
 * entran las secciones, y adentro de cada pagina se navega normal.
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
    submenu: [
      {
        href: "/inicio/stock/alertas",
        label: "Stock bajo y vencimientos",
        icon: AlertTriangle,
        showInMobile: false,
      },
      {
        href: "/inicio/stock/catalogo",
        label: "Catalogo de productos",
        icon: BookOpen,
        showInMobile: false,
      },
      {
        href: "/inicio/stock/consumos",
        label: "Consumos",
        icon: Droplets,
        showInMobile: false,
      },
      {
        href: "/inicio/stock/escanear",
        label: "Escanear productos",
        icon: Barcode,
        showInMobile: false,
      },
    ],
  },
  {
    href: "/inicio/caja/consultorio",
    label: "Caja",
    icon: Wallet,
    mobileLabel: "Caja",
    mobileIcon: DollarSign,
    submenu: [
      {
        href: "/inicio/caja/movimientos",
        label: "Movimientos consultorio",
        icon: Receipt,
        showInMobile: false,
      },
      {
        href: "/inicio/caja/metricas",
        label: "Metricas",
        icon: TrendingUp,
        showInMobile: false,
      },
      {
        href: "/inicio/caja/compras",
        label: "Compras",
        icon: ShoppingCart,
        showInMobile: false,
        roles: ["ADMIN", "USER"],
      },
      {
        href: "/inicio/caja/venta-combinada",
        label: "Venta combinada",
        icon: ShoppingBag,
        showInMobile: false,
      },
      {
        href: "/inicio/caja/venta-directa",
        label: "Venta directa",
        icon: Store,
        showInMobile: false,
      },
      {
        href: "/inicio/caja/precio-especial",
        label: "Precio especial",
        icon: Tag,
        showInMobile: false,
      },
    ],
  },
  {
    href: "/inicio/tratamientos",
    label: "Tratamientos",
    icon: Stethoscope,
    mobileLabel: "Tratam.",
    mobileIcon: Activity,
    // Medica (ADMIN) registra; cosmetologa ve/registra lo suyo. USER afuera.
    roles: ["ADMIN", "COSMETOLOGA"],
    submenu: [
      {
        href: "/inicio/tratamientos/peeling",
        label: "Peeling profundo",
        icon: Layers,
        showInMobile: false,
      },
      {
        href: "/inicio/tratamientos/procedimientos",
        label: "Procedimientos",
        icon: Stethoscope,
        showInMobile: false,
      },
      {
        href: "/inicio/tratamientos/mesoterapias",
        label: "Mesoterapias",
        icon: Syringe,
        showInMobile: false,
        roles: ["ADMIN"],
      },
    ],
  },
  // Usuarios: fuera del menu a pedido. La ruta sigue protegida por RoleGuard,
  // asi que ADMIN puede entrar tipeando /inicio/usuarios.
];

/** Filtra la navegacion segun los roles del usuario (recursivo para submenus). */
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