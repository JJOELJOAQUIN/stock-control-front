import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { currencyFormatter } from "@/lib/currencyFormatter";
import type { ProcedureOption } from "@/features/caja/types/cash.types";

/**
 * Modal informativo (solo lectura) con el catálogo de tratamientos de un
 * rol. Se dispara desde el menú del avatar: la Dra ve los cosmetológicos que
 * ofrece Gise; Gise ve los dermatológicos que ofrece la Dra. No registra
 * nada: es una referencia rápida de "qué se ofrece y a cuánto".
 *
 * Muestra precio de LISTA (nunca costo). Los ítems con amount = 0 son los que
 * siempre se cargan a mano; ahí no mostramos un precio falso.
 */
export function TreatmentsCatalogDialog({
  open,
  onOpenChange,
  title,
  description,
  procedures,
  accent = "violet",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  procedures: ProcedureOption[];
  accent?: "violet" | "sky";
}) {
  const badgeClass =
    accent === "sky"
      ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
      : "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300";

  const conPrecio = procedures.filter((p) => p.amount > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ?? "Lista de referencia. Precios de lista, sin costos."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {procedures.map((p) => (
            <div
              key={p.code}
              className="flex items-center justify-between gap-3 border-b py-2.5 text-sm last:border-b-0"
            >
              <span className="min-w-0 truncate">{p.label}</span>
              {p.amount > 0 ? (
                <Badge variant="secondary" className={badgeClass + " shrink-0 tabular-nums"}>
                  {currencyFormatter.format(p.amount)}
                </Badge>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">a convenir</span>
              )}
            </div>
          ))}
          {procedures.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin tratamientos cargados.
            </p>
          )}
        </div>

        <div className="border-t px-6 py-3 text-xs text-muted-foreground">
          {procedures.length} tratamientos · {conPrecio} con precio de lista.
        </div>
      </DialogContent>
    </Dialog>
  );
}