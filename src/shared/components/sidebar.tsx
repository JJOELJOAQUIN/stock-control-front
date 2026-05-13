import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {

  Package,
  Wallet,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Moon,
  Sun,
} from "lucide-react"

import { useTheme } from "@/core/context/theme-provider"
import { useAuth } from "@/core/auth/context/AuthProvider"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { HomeIcon } from 'lucide-react';

/* =========================
   MENU CONFIG
========================= */

export interface MenuItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  submenu?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {  
   
       icon: HomeIcon, label: "Home", href: "/inicio"
  
  },
  { icon: Package, label: "Stock", href: "/inicio/stock" },
  {
    icon: Wallet,
    label: "Caja",
    href: "/inicio/caja/consultorio",

  },
  {
    icon: Receipt,
    label: "Movimientos Consultorio",
    href: "/inicio/movimientos-consultorio",
  },
]

/* =========================
   HELPERS
========================= */

interface ActiveInfo {
  activeItem: MenuItem | null
  parents: string[]
}

function findActivePath(pathname: string, items: MenuItem[]): ActiveInfo | null {
  for (const item of items) {
    if (item.href === pathname) {
      return { activeItem: item, parents: [] }
    }

    if (item.submenu) {
      const result = findActivePath(pathname, item.submenu)
      if (result) {
        return {
          activeItem: result.activeItem,
          parents: [item.label, ...result.parents],
        }
      }
    }
  }
  return null
}

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return "U"
}

/* =========================
   MENU ITEM COMPONENT
========================= */

function MenuItemComponent({
  item,
  activeInfo,
  isCollapsed,
  expandedMenus,
  toggleExpand,
}: {
  item: MenuItem
  activeInfo: ActiveInfo
  isCollapsed: boolean
  expandedMenus: string[]
  toggleExpand: (label: string) => void
}) {
  const Icon = item.icon
  const isActive = activeInfo.activeItem?.href === item.href
  const isParentActive = activeInfo.parents.includes(item.label)
  const hasSubmenu = !!item.submenu?.length
  const isExpanded = expandedMenus.includes(item.label)

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <Link
          to={item.href}
          className={cn(
            "flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : isParentActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>{item.label}</span>}
        </Link>

        {hasSubmenu && !isCollapsed && (
          <button
            type="button"
            onClick={() => toggleExpand(item.label)}
            className="rounded-lg p-1 hover:bg-accent/50"
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

      {hasSubmenu && !isCollapsed && isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
          {item.submenu!.map((sub) => (
            <MenuItemComponent
              key={sub.label}
              item={sub}
              activeInfo={activeInfo}
              isCollapsed={isCollapsed}
              expandedMenus={expandedMenus}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* =========================
   SIDEBAR
========================= */

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
}: {
  isCollapsed: boolean
  onToggleCollapse: () => void
}) {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { authState, logout } = useAuth()

  const user = authState.user
  const role = authState.roles

  const activeInfo =
    findActivePath(location.pathname, menuItems) || {
      activeItem: null,
      parents: [],
    }

  const [expandedMenus, setExpandedMenus] = useState<string[]>(
    activeInfo.parents
  )

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-all",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-3">
        <Link
          to="/inicio"
          className={cn(
            "flex items-center gap-3 overflow-hidden transition-all",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          {/* Logo container */}
          <div
            className={cn(
              "flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-all",
              isCollapsed ? "h-10 w-10" : "h-10 w-10"
            )}
          >
            <img
              src="/logo_nuevo.png"
              alt="RosaRosa"
              className="h-6 w-auto object-contain"
            />
          </div>

          {/* Brand name */}
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Pilar Murillo Dra
            </span>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>


      {/* Menu */}
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <MenuItemComponent
            key={item.label}
            item={item}
            activeInfo={activeInfo}
            isCollapsed={isCollapsed}
            expandedMenus={expandedMenus}
            toggleExpand={toggleExpand}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        {/* Theme */}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn("w-full justify-start gap-3 mb-2", isCollapsed && "justify-center")}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
          {!isCollapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>}
        </Button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl p-2 hover:bg-accent/50",
                isCollapsed && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user?.displayName, user?.email)}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="font-medium">{user?.displayName ?? "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    {role}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
