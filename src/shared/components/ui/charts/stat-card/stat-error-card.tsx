import { AlertTriangle } from "lucide-react";

export function ErrorStatCard({ message = "Error loading data" }: { message?: string }) {
  return (
    <article className="flex min-w-[200px] items-center gap-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 dark:border-destructive/30 dark:bg-destructive/20">

      {/* ICON ERROR */}
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20 text-destructive dark:bg-destructive/30">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-destructive dark:text-destructive">
          Error
        </h3>

        <p className="text-sm text-destructive/80 dark:text-destructive/70 whitespace-nowrap">
          {message}
        </p>
      </div>

    </article>
  );
}
