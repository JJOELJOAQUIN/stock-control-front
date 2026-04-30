import { CalendarDays, Sparkles, Stethoscope, Wallet } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type Props = {
  date: string;
  setDate: (value: string) => void;
  doctorTotal: number;
  cosmetologistTotal: number;
  netIncome: number;
  isLoading?: boolean;
};

export function DailySplitSummary({
  date,
  setDate,
  doctorTotal,
  cosmetologistTotal,
  netIncome,
  isLoading = false,
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

          <div className="w-full space-y-2 sm:w-56">
            <Label htmlFor="daily-split-date">Fecha</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="daily-split-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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