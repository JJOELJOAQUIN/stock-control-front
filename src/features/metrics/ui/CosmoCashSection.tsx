import { useState } from "react";
import { Banknote, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { businessToday } from "@/lib/businessDate";
import { useAuth } from "@/core/auth/context/AuthProvider";
import { useHasRole } from "@/features/auth/hooks/useRoles";
import {
  useAddCosmoCashMutation,
  useDeleteCosmoCashMutation,
  useGetCosmoCashQuery,
} from "../api/metricsApi";

const dayFormatter = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" });

/** "2026-11-20" → "20/11", sin pasar por zona horaria (es una fecha, no un instante). */
function formatDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return dayFormatter.format(new Date(y, m - 1, d));
}

/**
 * Efectivo que la cosmetóloga le deja a la médica en el mes.
 *
 * La cuenta del mes dice cuánto le corresponde a la médica de lo que hizo la
 * cosmetóloga (`owed`). Cada vez que la cosmetóloga deja efectivo lo suma
 * acá (aunque deje de más) y el saldo muestra lo que falta o lo que dejó de
 * más. Las dos lo ven; las dos pueden cargar, y cada una borrar lo suyo (la
 * médica, cualquiera).
 */
export function CosmoCashSection({
  year,
  month,
  owed,
  mine,
}: {
  year: number;
  month: number;
  /** Lo que le corresponde a la médica de lo que hizo la cosmetóloga. */
  owed: number;
  /** true en la vista de la cosmetóloga ("dejaste"), false en la de la médica ("dejó"). */
  mine: boolean;
}) {
  const { authState } = useAuth();
  const isAdmin = useHasRole(["ADMIN"]);
  const myEmail = authState.user?.email?.toLowerCase() ?? "";

  const { data, isLoading } = useGetCosmoCashQuery({ year, month });
  const [addCash, { isLoading: isAdding }] = useAddCosmoCashMutation();
  const [deleteCash] = useDeleteCosmoCashMutation();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(businessToday());
  const [note, setNote] = useState("");

  const total = Number(data?.total ?? 0);
  const entries = data?.entries ?? [];
  const balance = Math.round((owed - total) * 100) / 100;

  // La fecha por defecto cae en el mes que se está mirando: si se mira un mes
  // anterior, el último día de ese mes; si es el actual, hoy.
  const today = businessToday();
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const lastDayOfMonth = `${monthPrefix}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
  const defaultDate = today.startsWith(monthPrefix) ? today : lastDayOfMonth < today ? lastDayOfMonth : today;
  const effectiveDate = date.startsWith(monthPrefix) ? date : defaultDate;
  const isFutureMonth = `${monthPrefix}-01` > today;

  const onAdd = async () => {
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Ingresá un monto mayor a cero");
      return;
    }
    try {
      await addCash({
        amount: value,
        date: effectiveDate,
        note: note.trim() || undefined,
      }).unwrap();
      toast.success(`Se sumaron ${currencyFormatter.format(value)} de efectivo`);
      setAmount("");
      setNote("");
      setDate(effectiveDate);
    } catch (error: unknown) {
      const msg = (error as { data?: { message?: string } })?.data?.message;
      toast.error(msg || "No se pudo cargar el efectivo");
    }
  };

  const onDelete = async (id: string, value: number) => {
    if (!window.confirm(`¿Borrar la entrega de ${currencyFormatter.format(value)}?`)) return;
    try {
      await deleteCash(id).unwrap();
      toast.success("Entrega borrada");
    } catch (error: unknown) {
      const msg = (error as { data?: { message?: string } })?.data?.message;
      toast.error(msg || "No se pudo borrar");
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Banknote className="size-4" />
        </div>
        <div>
          <p className="font-medium">
            {mine ? "Efectivo que le dejaste a la médica" : "Efectivo que dejó Gise"}
          </p>
          <p className="text-xs text-muted-foreground">
            {mine
              ? "Sumá cada vez que dejes efectivo, también si dejás de más. Se descuenta de lo que le corresponde a la médica."
              : "Lo que Gise fue dejando en efectivo este mes, descontado de lo que le corresponde a la médica."}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Le corresponde a la médica</span>
          <span className="tabular-nums">{currencyFormatter.format(owed)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            − Efectivo que {mine ? "dejaste" : "dejó"}
          </span>
          <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
            {currencyFormatter.format(total)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t pt-2">
          <span className="font-medium">
            {balance > 0 ? "Falta dejar" : balance < 0 ? `${mine ? "Dejaste" : "Dejó"} de más` : "Saldada"}
          </span>
          <span
            className={
              "text-lg font-bold tabular-nums " +
              (balance > 0 ? "" : "text-emerald-600 dark:text-emerald-400")
            }
          >
            {currencyFormatter.format(Math.abs(balance))}
          </span>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="rounded-md border">
          {entries.map((e) => {
            const canDelete = isAdmin || e.createdBy?.toLowerCase() === myEmail;
            return (
              <div
                key={e.id}
                className="flex items-center justify-between gap-2 border-b px-3 py-2 text-sm last:border-b-0"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatDay(e.date)}
                  </span>
                  <span className="truncate">{e.note || "Efectivo"}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums font-medium">
                    {currencyFormatter.format(Number(e.amount))}
                  </span>
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                      aria-label="Borrar entrega"
                      onClick={() => onDelete(e.id, Number(e.amount))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {!isLoading && entries.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Todavía no hay efectivo cargado en este mes.
        </p>
      )}

      {!isFutureMonth && (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1.5fr_auto]">
        <Input
          type="number"
          inputMode="decimal"
          min="0"
          step="100"
          placeholder="Monto"
          aria-label="Monto en efectivo"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          type="date"
          aria-label="Fecha"
          value={effectiveDate}
          min={`${monthPrefix}-01`}
          max={lastDayOfMonth < today ? lastDayOfMonth : today}
          onChange={(e) => setDate(e.target.value)}
          className="sm:w-40"
        />
        <Input
          placeholder="Nota (opcional)"
          aria-label="Nota"
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button type="button" onClick={onAdd} disabled={isAdding || !amount}>
          <Plus className="size-4" /> Sumar
        </Button>
      </div>
      )}
    </div>
  );
}
