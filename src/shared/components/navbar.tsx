import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

import { DarkModeToggle } from "./dark-mode-toggle";
import { useAuth } from "@/core/auth/context/AuthProvider";
import { useFirebaseClaims } from "@/core/auth/hooks/useDecodedJwt";
import { getInitials } from "../lib/initials/initials";

import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { capitalize } from "../lib/capitalize";
import React from "react";

export function Navbar() {
  const { logout } = useAuth();
  const {claims, loading} = useFirebaseClaims();

  const location = useLocation();

  // /inicio/seguimiento/detalle → ["inicio", "seguimiento", "detalle"]
  const segments = location.pathname.split("/").filter(Boolean);

  // Construcción acumulativa de rutas
  const buildHref = (index: number) =>
    "/" + segments.slice(0, index + 1).join("/");

  const MAX_VISIBLE = 3; // Maneja colapso igual que el ejemplo de shadcn

  const shouldCollapse = segments.length > MAX_VISIBLE;

  const visibleSegments = shouldCollapse
    ? [segments[0], "...", ...segments.slice(-2)]
    : segments;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            {visibleSegments.map((seg, index) => {
              const isLast = index === visibleSegments.length - 1;

              if (seg === "...") {
                const hidden = segments.slice(1, -2);

                return (
                  <React.Fragment key={`ellipsis-${index}`}>
                    <BreadcrumbItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1">
                          <BreadcrumbEllipsis className="size-4" />
                          <span className="sr-only">Toggle menu</span>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start">
                          {hidden.map((h, i) => (
                            <DropdownMenuItem key={i} asChild>
                              <Link to={buildHref(i + 1)}>{h}</Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>

                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              }

              // Segmento normal
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={buildHref(index + 1)}>{capitalize(seg)}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div> */}

        {/* Notifications */}
        {/* <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive"></span>
        </button> */}

        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted cursor-pointer"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <span className="text-xs font-semibold text-foreground">
                  {getInitials(claims?.name || "JD")}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="start" className="w-48 ">
            <DropdownMenuItem
              onClick={() => {
                logout();
              }}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
