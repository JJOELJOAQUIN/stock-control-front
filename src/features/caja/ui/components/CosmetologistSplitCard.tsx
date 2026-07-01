"use client";

import { Stethoscope, Syringe, ShoppingBag } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { useGetCosmetologistDailySplitQuery } from "@/features/caja/api/cashApi";

type Props = {
  date: string;
  setDate: (value: string) => void;
};

/**
 * Card exclusiva de la COSMETÓLOGA.
 * Muestra SOLO la ganancia que se lleva la médica del trabajo de la
 * cosmetóloga (su % de procedimientos + su % de ventas del día).
 * No expone lo que gana la médica por su propio trabajo.
 */
export function CosmetologistSplitCard({ date, setDate }: Props) {
  const { data, isFetching } = useGetCosmetologistDailySplitQuery({
    context: "CONSULTORIO",
    date,
  });

  const procedureCosmetologist = Number(data?.procedureCosmetologist ?? 0);
  const procedureDoctor = Number(data?.procedureDoctor ?? 0);
  const salesCosmetologist = Number(data?.salesCosmetologist ?? 0);
  const salesDoctor = Number(data?.salesDoctor ?? 0);

  const medicaTotal = procedureDoctor + salesDoctor;

  const show = (value: number) =>
    isFetching ? "..." : currencyFormatter.format(value);

  const doctorPercent = (mine: number, doctor: number) => {
    const total = mine + doctor;
    if (total <= 0) return 0;
    return Math.round((doctor / total) * 100);
  };

  return (
    <section className="space-y-4">
      {/* Header + fecha */}
      <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-background">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Ganancia de la médica</h2>
            <p className="text-sm text-muted-foreground">
              Lo que se lleva la médica de tu trabajo del día
            </p>
          </div>

          <div className="w-full space-y-2 sm:w-64">
            <Label htmlFor="cosmetologist-split-date">Fecha</Label>
            <DatePicker
              id="cosmetologist-split-date"
              value={date}
              onChange={setDate}
              placeholder="Seleccionar fecha"
            />
          </div>
        </CardContent>
      </Card>

      {/* Total que se lleva la médica de tu trabajo */}
      <Card className="border-accent/30 bg-gradient-to-br from-accent/15 to-background">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Stethoscope className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">
              La médica se lleva (de tu trabajo)
            </span>
            <span className="text-2xl font-bold tracking-tight text-accent">
              {show(medicaTotal)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Desglose por tipo */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Procedimientos */}
        <Card className="border-border/60">
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary/60 text-secondary-foreground">
                <Syringe className="size-4" />
              </span>
              <span className="font-semibold">Procedimientos</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Médica ({doctorPercent(procedureCosmetologist, procedureDoctor)}% de tus procedimientos)
              </span>
              <span className="font-semibold text-accent">
                {show(procedureDoctor)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Ventas */}
        <Card className="border-border/60">
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <ShoppingBag className="size-4" />
              </span>
              <span className="font-semibold">Ventas de productos</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Médica ({doctorPercent(salesCosmetologist, salesDoctor)}% de tus ventas)
              </span>
              <span className="font-semibold text-accent">
                {show(salesDoctor)}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}