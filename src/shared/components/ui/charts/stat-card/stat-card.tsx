import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { capitalizeProper } from "@/shared/lib/initials/capitalizeProper";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  trend?: "up" | "down";
  icon: ReactNode;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  change,
  trend,
  icon,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;

  // colores idénticos a tu modelo
  const trendBg =
    trend === "up"
      ? "bg-success-50 dark:bg-success-500/15"
      : "bg-destructive/20 dark:bg-destructive/15";

  const trendText =
    trend === "up"
      ? "text-success-600 dark:text-success-500"
      : "text-destructive dark:text-destructive";

  return (
    <article className="flex w-full  items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-primary/20 dark:bg-white/5 mb-4 ">
      <div className="inline-flex h-12 w-12  items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="flex flex-col">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {value}
        </h3>

        <p className="flex items-center gap-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {capitalizeProper(title)}

          {trend && change && (
            <span
              className={cn(
                "inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium",
                trendBg,
                trendText
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {change}
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
