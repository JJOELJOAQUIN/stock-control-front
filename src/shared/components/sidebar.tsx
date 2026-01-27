import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Truck,
  Store,
  ChartPie
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserDropdown } from "./user-dropdown";
import { useAuth } from "@/core/auth/context/AuthProvider";
import { useDecodedJwt } from "@/core/auth/hooks/useDecodedJwt";
import { getInitials } from "../lib/initials/initials";
import type { JSX } from "react";

export interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Inicio", href: "/inicio" },
  { icon: Truck, label: "Seguimiento", href: "/inicio/seguimiento" },
  { icon: Users, label: "Usuarios", href: "/inicio/usuarios" },
  {
    icon: Store,
    label: "Comerciales",
    href: "/inicio/commercial",
    submenu: [
      {
        label: "Análisis de Clientes",
        href: "/inicio/commercial/analysis",
        icon: ChartPie,
      },
    ],
  },
  {
    icon: FolderKanban,
    label: "Projects",
    href: "/projects",
    submenu: [
      { label: "All Projects", href: "/projects/all", icon: LayoutDashboard },
      { label: "Active", href: "/projects/active", icon: LayoutDashboard },
      { label: "Archived", href: "/projects/archived", icon: LayoutDashboard },
    ],
  },
];

interface ActiveInfo {
  activeItem: MenuItem | null;
  parents: string[];
}

function findActivePath(pathname: string, items: MenuItem[]): ActiveInfo | null {
  for (const item of items) {
    if (item.href === pathname) {
      return { activeItem: item, parents: [] };
    }

    if (item.submenu) {
      const result = findActivePath(pathname, item.submenu);
      if (result) {
        return {
          activeItem: result.activeItem,
          parents: [item.label, ...result.parents],
        };
      }
    }
  }
  return null;
}

function renderMenu(
  items: MenuItem[],
  activeInfo: ActiveInfo,
  navigate: (href: string) => void,
  isCollapsed: boolean,
  expandedMenus: string[],
  toggleExpand: (label: string) => void
): JSX.Element[] {
  return items.map((item) => {
    const Icon = item.icon;
    const isActive = activeInfo.activeItem?.href === item.href;
    const hasSubmenu = Array.isArray(item.submenu);
    const isExpanded = expandedMenus.includes(item.label);

    return (
      <div
        key={item.label}
        className="flex flex-col"
      >
        <div className="flex items-center">
          <button
            onClick={() => {
              if (!hasSubmenu) navigate(item.href);
              else navigate(item.href);
            }}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors w-full",
              isActive
                ? "bg-brand-gradient text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="">{item.label}</span>}
          </button>


          {hasSubmenu && !isCollapsed && (
            <button
              onClick={() => toggleExpand(item.label)}
              className="pr-2"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
          )}
        </div>


        {hasSubmenu && !isCollapsed && isExpanded && item.submenu && (
          <div className="ml-6 mt-1 space-y-1">
            {renderMenu(item.submenu, activeInfo, navigate, isCollapsed, expandedMenus, toggleExpand)}
          </div>
        )}
      </div>

    );
  });
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
}: {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const decoded = useDecodedJwt();

  const activeInfo = findActivePath(pathname, menuItems) || {
    activeItem: null,
    parents: [],
  };

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >

      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!isCollapsed && (
          <Link to="/inicio">
            <img src="/logo_rosarosa-01.PNG" alt="Logo" className="w-12" />
          </Link>
        )}

        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>


      <nav className="flex-1 space-y-1 p-4">
        {renderMenu(menuItems, activeInfo, navigate, isCollapsed, expandedMenus, toggleExpand)}
      </nav>


      <div className="border-t border-border p-4">
        <UserDropdown
          userName={decoded?.name || "John Doe"}
          userEmail={decoded?.email || ""}
          userInitials={getInitials(decoded?.name || "JD")}
          isCollapsed={isCollapsed}
          onLogout={logout}
        />
      </div>
    </aside>
  );
}
