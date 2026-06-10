// shared/components/price-stat.tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PriceStatProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: "neutral" | "emerald" | "amber";
};

const accentStyles = {
  neutral: "text-foreground",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
} as const;

const iconStyles = {
  neutral: "bg-muted text-muted-foreground",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
} as const;

export function PriceStat({
  icon: Icon,
  label,
  value,
  hint,
  accent = "neutral",
}: PriceStatProps) {
  return (
    <div className="group flex flex-col gap-2 rounded-xl border bg-background p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-center gap-2">
        <span className={cn("flex size-7 items-center justify-center rounded-md", iconStyles[accent])}>
          <Icon className="size-4" />
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>

      <p className={cn("text-xl font-semibold tabular-nums leading-none", accentStyles[accent])}>
        {value}
      </p>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}