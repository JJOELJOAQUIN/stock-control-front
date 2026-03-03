import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import type { ReactNode } from "react"

// ===========================================
// BASE BENTO CARD
// ===========================================

interface BentoCardProps {
  children: ReactNode
  className?: string
  href?: string
}

export function BentoCard({ children, className = "", href = "#" }: BentoCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6",
        "bg-card text-card-foreground border border-border",
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        className
      )}
    >
      {children}
    </Link>
  )
}

// ===========================================
// BENTO NAV CARD - Card para navegar a secciones
// ===========================================

interface BentoNavCardProps {
  href: string
  className?: string
  icon: ReactNode
  title: string
  description?: string
  variant?: "primary" | "secondary" | "accent" | "gradient"
}

export function BentoNavCard({
  href,
  className,
  icon,
  title,
  description,
  variant = "primary",
}: BentoNavCardProps) {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-card text-card-foreground border border-border hover:border-primary/50",
    accent: "bg-accent text-accent-foreground",
    gradient: "bg-primary text-primary-foreground",
  }


  return (
    <BentoCard
      href={href}
      className={cn(variantStyles[variant], className)}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            variant === "secondary"
              ? "bg-primary/10 text-primary"
              : "bg-primary/20 text-primary-foreground"
          )}
        >

          {icon}
        </div>
        <div>
          <h3 className={cn(
            "text-xl font-bold",
            variant === "secondary" ? "text-foreground" : ""
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              "mt-1 text-sm",
              variant === "secondary" ? "text-muted-foreground" : "opacity-80"
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    </BentoCard>
  )
}

// ===========================================
// BENTO STAT CARD - Estadistica
// ===========================================

interface BentoStatCardProps {
  href?: string
  className?: string
  label: string
  value: string | number
  change?: string
  changePositive?: boolean
  icon?: ReactNode
}

export function BentoStatCard({
  href = "#",
  className,
  label,
  value,
  change,
  changePositive = true,
  icon,
}: BentoStatCardProps) {
  return (
<BentoCard
  href={href}
  className={cn(
    "bg-primary text-primary-foreground",
    "dark:bg-primary/90",
    className
  )}
>

      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={cn(
              "text-sm font-medium",
              changePositive ? "text-emerald-500" : "text-destructive"
            )}>
              {change}
            </p>
          )}
        </div>
      </div>
    </BentoCard>
  )
}

// ===========================================
// BENTO QUICK ACTION CARD
// ===========================================

interface BentoQuickActionCardProps {
  href: string
  className?: string
  icon: ReactNode
  title: string
  badge?: string
}

export function BentoQuickActionCard({
  href,
  className,
  icon,
  title,
  badge,
}: BentoQuickActionCardProps) {
  return (
    <BentoCard
      href={href}
      className={cn("bg-card border border-border", className)}
    >
      <div className="flex h-full flex-col items-center justify-center text-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          {badge && (
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {badge}
            </span>
          )}
        </div>
      </div>
    </BentoCard>
  )
}

// ===========================================
// BENTO SECTION CARD - Para secciones grandes
// ===========================================

interface BentoSectionCardProps {
  href: string
  className?: string
  icon: ReactNode
  title: string
  description?: string
  items?: string[]
}

export function BentoSectionCard({
  href,
  className,
  icon,
  title,
  description,
  items = [],
}: BentoSectionCardProps) {
  return (
    <BentoCard
      href={href}
      className={cn("bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground", className)}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{title}</h3>
          {description && (
            <p className="mt-1 text-sm opacity-80">{description}</p>
          )}
          {items.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </BentoCard>
  )
}
