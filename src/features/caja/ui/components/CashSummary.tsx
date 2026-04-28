type Props = {
  income: number;
  expense: number;
  net: number;
};

export function CashSummary({ income, expense, net }: Props) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <article className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Ingresos</p>
        <p className="text-2xl font-bold">${income.toLocaleString()}</p>
      </article>

      <article className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Egresos</p>
        <p className="text-2xl font-bold">${expense.toLocaleString()}</p>
      </article>

      <article className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Neto</p>
        <p className="text-2xl font-bold">${net.toLocaleString()}</p>
      </article>
    </section>
  );
}