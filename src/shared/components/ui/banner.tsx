import { type ReactNode } from "react";

interface BannerProps {
  title: string;
  description?: string;
  children?: ReactNode; // opcional
}

export function Banner({ title, description, children }: BannerProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 p-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-700 dark:text-white">{title}</h2>

        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Renderiza la zona de acciones solo si existe */}
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
