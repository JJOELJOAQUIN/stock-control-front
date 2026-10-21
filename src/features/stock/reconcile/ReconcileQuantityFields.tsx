import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/lib/utils";
import { unitLong, unitShort } from "@/lib/units";
import { computeTarget, qtyWithUnit, type ReconcileMode } from "./reconcileQuantity";

type Props = {
  mode: ReconcileMode;
  onModeChange: (mode: ReconcileMode) => void;
  raw: string;
  onRawChange: (raw: string) => void;
  currentStored: number;
  unit?: string | null;
  scale: number;
  /** Contenido de un envase en unidades guardadas (para la ayuda). */
  unitsPerPackageStored?: number | null;
  /** Lo que necesita la carga que falló (diálogo automático). */
  requiredStored?: number;
  autoFocus?: boolean;
};

/**
 * Campos para corregir el stock de un producto, en su unidad REAL (ml con
 * decimales, ampollas enteras...). Muestra siempre cómo queda: "8 ml →
 * 7,5 ml". Lo usan la Reconciliación de Stock y el diálogo automático.
 */
export function ReconcileQuantityFields({
  mode,
  onModeChange,
  raw,
  onRawChange,
  currentStored,
  unit,
  scale,
  unitsPerPackageStored,
  requiredStored,
  autoFocus,
}: Props) {
  const short = unitShort(unit);
  const long = unitLong(unit);
  const isMl = unit === "ML";
  const { targetStored, touched, error } = computeTarget(mode, raw, currentStored, scale);
  const fmt = (stored: number) => qtyWithUnit(stored, unit, scale);
  const packageText =
    unitsPerPackageStored && unitsPerPackageStored > scale
      ? `1 envase = ${fmt(unitsPerPackageStored)}`
      : null;

  const diff = targetStored == null ? 0 : targetStored - currentStored;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm" role="radiogroup">
        {(
          [
            ["total", "Tengo en total"],
            ["add", "Sumar al stock"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => onModeChange(value)}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-colors",
              mode === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Field>
        <FieldLabel>
          {mode === "total"
            ? `¿Cuánto hay en total? (${long})`
            : `¿Cuánto agregás? (${long})`}
        </FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            inputMode={isMl ? "decimal" : "numeric"}
            placeholder={isMl ? "Ej: 7,5" : "Ej: 18"}
            value={raw}
            onChange={(e) => onRawChange(e.target.value)}
            autoFocus={autoFocus}
            className="max-w-40"
          />
          <span className="text-sm text-muted-foreground">{short}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isMl
            ? "Sumá todo en ml: viales cerrados + lo que queda en los abiertos. Ej: 2 viales de 3 ml + 1 abierto con 2 ml = 8 ml."
            : mode === "total"
              ? `Contá todas las ${long} que hay, cerradas y sueltas.`
              : `Solo lo que falta cargar; se suma a lo que ya figura.`}
          {packageText && ` (${packageText})`}
        </p>
      </Field>

      <div
        className={cn(
          "rounded-lg border px-3 py-2 text-sm",
          error && "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
        )}
      >
        {error ? (
          error
        ) : (
          <>
            <span className="text-muted-foreground">En sistema </span>
            <b>{fmt(currentStored)}</b>
            <span className="text-muted-foreground"> → queda </span>
            <b className="text-foreground">
              {targetStored == null ? "—" : fmt(targetStored)}
            </b>
            {touched && targetStored != null && diff !== 0 && (
              <span className={diff > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                {" "}
                ({diff > 0 ? "+" : "−"}
                {fmt(Math.abs(diff))})
              </span>
            )}
            {requiredStored != null && targetStored != null && (
              <p
                className={cn(
                  "mt-1",
                  targetStored >= requiredStored
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
                )}
              >
                {targetStored >= requiredStored
                  ? `Alcanza: después de esta carga quedan ${fmt(targetStored - requiredStored)}.`
                  : `Todavía no alcanza: esta carga necesita ${fmt(requiredStored)}.`}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
