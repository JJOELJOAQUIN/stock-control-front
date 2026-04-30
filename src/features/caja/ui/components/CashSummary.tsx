import { Card, CardContent } from "@/shared/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";


type Props = {
  income: number;
  expense: number;
  net: number;
};

export function CashSummary({ income, expense, net }: Props) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950/20">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <TrendingUp className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">
              Ingresos
            </span>
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(income)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-200/50 bg-gradient-to-br from-rose-50 to-background dark:from-rose-950/20">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
            <TrendingDown className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">
              Egresos
            </span>
            <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(expense)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">
              Neto
            </span>
            <span
              className={`text-2xl font-bold tracking-tight ${
                net >= 0 ? "text-primary" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatCurrency(net)}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
