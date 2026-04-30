import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

type BentoVariant = "brand" | "brandSoft" | "brandMuted";

type BentoBaseProps = {
  href: string;
  icon: React.ReactNode;
  className?: string;
  variant?: BentoVariant;
};

type BentoNavCardProps = BentoBaseProps & {
  title: string;
  description: string;
};

type BentoSectionCardProps = BentoNavCardProps & {
  items: string[];
};

type BentoStatCardProps = BentoBaseProps & {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
};

const cardVariants: Record<BentoVariant, string> = {
  brand:
    "border-primary/30 bg-primary/10 hover:bg-primary/15 hover:border-primary/40",
  brandSoft:
    "border-accent/30 bg-accent/10 hover:bg-accent/15 hover:border-accent/40",
  brandMuted:
    "border-secondary bg-secondary/60 hover:bg-secondary hover:border-primary/20",
};

const iconVariants: Record<BentoVariant, string> = {
  brand: "bg-primary/10 text-primary",
  brandSoft: "bg-accent/10 text-accent",
  brandMuted: "bg-background/70 text-secondary-foreground",
};

const itemVariants: Record<BentoVariant, string> = {
  brand: "bg-primary/10 text-primary",
  brandSoft: "bg-accent/10 text-accent",
  brandMuted: "bg-background/70 text-secondary-foreground",
};

function getVariant(variant?: BentoVariant): BentoVariant {
  return variant ?? "brand";
}

export function BentoNavCard({
  href,
  icon,
  title,
  description,
  className,
  variant,
}: BentoNavCardProps) {
  const selectedVariant = getVariant(variant);

  return (
    <Link
      to={href}
      className={cn(
        "group rounded-xl border-4 p-5 transition-all duration-200",

        "hover:-translate-y-0.5 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        cardVariants[selectedVariant],
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
          iconVariants[selectedVariant]
        )}
      >
        {icon}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold tracking-tight text-foreground">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}

export function BentoSectionCard({
  href,
  icon,
  title,
  description,
  items,
  className,
  variant,
}: BentoSectionCardProps) {
  const selectedVariant = getVariant(variant);

  return (
    <Link
      to={href}
      className={cn(
        "group flex min-h-64 flex-col justify-between rounded-xl border-4 p-6 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-sm",

        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        cardVariants[selectedVariant],
        className
      )}
    >
      <div>
        <div
          className={cn(
            "mb-5 flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
            iconVariants[selectedVariant]
          )}
        >
          {icon}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              itemVariants[selectedVariant]
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function BentoStatCard({
  href,
  icon,
  label,
  value,
  change,
  changePositive = true,
  className,
  variant,
}: BentoStatCardProps) {
  const selectedVariant = getVariant(variant);

  return (
    <Link
      to={href}
      className={cn(
        "group rounded-xl border-4 p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",

        cardVariants[selectedVariant],
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            iconVariants[selectedVariant]
          )}
        >
          {icon}
        </div>

        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              changePositive ? "text-primary" : "text-destructive"
            )}
          >
            {change}
          </span>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{label}</p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </Link>
  );
}