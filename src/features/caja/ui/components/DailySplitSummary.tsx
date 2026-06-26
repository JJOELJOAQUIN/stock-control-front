import { Sparkles, Stethoscope, Wallet } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";

import { Label } from "@/shared/components/ui/label";
import { DatePicker } from "@/shared/components/ui/date-picker";

type Props = {
  date: string;
  setDate: (value: string) => void;
  doctorTotal: number;
  cosmetologistTotal: number;
  netIncome: number;
  isLoading?: boolean;
  /** Muestra la tarjeta "Neto ingresos". Default: true. */
  showNetIncome?: boolean;
};

export function DailySplitSummary({
  date,
  setDate,
  doctorTotal,
  cosmetologistTotal,
  netIncome,
  isLoading = false,
  showNetIncome = true,
}: Props) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value);

  const displayValue = (value: number) =>
    isLoading ? "..." : formatCurrency(value);

  return (
    <section className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Reparto diario
            </h2>
            <p className="text-sm text-muted-foreground">
              Totales calculados por fecha seleccionada
            </p>
          </div>

          <div className="w-full space-y-2 sm:w-64">
            <Label htmlFor="daily-split-date">Fecha</Label>
            <DatePicker
              id="daily-split-date"
              value={date}
              onChange={setDate}
              placeholder="Seleccionar fecha"
            />
          </div>
        </CardContent>
      </Card>

      <section
        className={`grid grid-cols-1 gap-4 ${
          showNetIncome ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {showNetIncome && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="size-6" />
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Neto ingresos
                </span>
                <span className="text-2xl font-bold tracking-tight text-primary">
                  {displayValue(netIncome)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-background">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Stethoscope className="size-6" />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-muted-foreground">
                Médica
              </span>
              <span className="text-2xl font-bold tracking-tight text-accent">
                {displayValue(doctorTotal)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary bg-gradient-to-br from-secondary/70 to-background">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background/70 text-secondary-foreground">
              <Sparkles className="size-6" />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-muted-foreground">
                Cosmetóloga
              </span>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {displayValue(cosmetologistTotal)}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}