// src/shared/layouts/components/MobileBottomNav.tsx
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  icon: LucideIcon;
  label: string;
};

type Props = {
  navItems: NavItem[];
  currentPath: string;
  onNavigate: (to: string) => void;
};

export function MobileBottomNav({ navItems, currentPath, onNavigate }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background">
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}