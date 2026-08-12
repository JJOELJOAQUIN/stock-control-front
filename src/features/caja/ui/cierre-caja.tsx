import { useState } from "react";
import { toast } from "sonner";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Lock, CheckCircle2 } from "lucide-react";

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import { currencyFormatter } from "@/lib/currencyFormatter";
import {
  useGetDailyPreviewQuery,
  useGetCloseHistoryQuery,
  useCloseCashMutation,
} from "@/features/caja/api/caschCloseApi";

const CONTEXT = "CONSULTORIO";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function CierreCajaPage() {
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");

  const { data: summary, isLoading } = useGetDailyPreviewQuery({ context: CONTEXT, date });
  const { data: history } = useGetCloseHistoryQuery({ context: CONTEXT });
  const [closeCash, { isLoading: closing }] = useCloseCashMutation();

  const doClose = async () => {
    try {
      await closeCash({ context: CONTEXT, date, note }).unwrap();
      toast.success("Caja cerrada");
      setNote("");
    } catch (e: any) {
      toast.error(e?.data?.message || "No se pudo cerrar la caja");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cierre de caja</h1>
          <p className="text-sm text-muted-foreground">
            Efectivo y transferencia del día. Cerrá para dejar la foto registrada.
          </p>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full sm:w-44"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-4 text-primary" />
            {fmtDate(date)}
            {summary?.closed && (
              <Badge variant="secondary" className="ml-auto gap-1">
                <CheckCircle2 className="size-3" />
                Cerrada
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {summary?.closed
              ? `Cerrada por ${summary.closedBy}.`
              : "Todavía sin cerrar. Los montos se actualizan en vivo."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Cargando…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MethodCard label="Efectivo" value={summary?.cashNet ?? 0} highlight />
                <MethodCard label="Transferencia" value={summary?.transferNet ?? 0} highlight />
                <MethodCard label="Débito" value={summary?.debitNet ?? 0} />
                <MethodCard label="Crédito" value={summary?.creditNet ?? 0} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <TotalCard
                  icon={<ArrowDownCircle className="size-4 text-emerald-600" />}
                  label="Entradas"
                  value={summary?.totalIn ?? 0}
                />
                <TotalCard
                  icon={<ArrowUpCircle className="size-4 text-destructive" />}
                  label="Salidas"
                  value={summary?.totalOut ?? 0}
                />
                <TotalCard label="Neto del día" value={summary?.netTotal ?? 0} strong />
              </div>

              {summary?.note && (
                <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {summary.note}
                </p>
              )}

              {!summary?.closed && (
                <div className="space-y-2 border-t pt-4">
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nota del cierre (opcional)"
                  />
                  <div className="flex justify-end">
                    <Button onClick={doClose} disabled={closing}>
                      <Lock className="mr-2 size-4" />
                      {closing ? "Cerrando…" : "Cerrar caja"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cierres anteriores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Día</TableHead>
                  <TableHead className="text-right">Efectivo</TableHead>
                  <TableHead className="text-right">Transferencia</TableHead>
                  <TableHead className="text-right">Neto</TableHead>
                  <TableHead>Cerró</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history ?? []).map((h) => (
                  <TableRow key={`${h.context}-${h.date}`}>
                    <TableCell className="font-medium">{fmtDate(h.date)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {currencyFormatter.format(h.cashNet)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {currencyFormatter.format(h.transferNet)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {currencyFormatter.format(h.netTotal)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{h.closedBy}</TableCell>
                  </TableRow>
                ))}
                {(history ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      Todavía no hay cierres.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MethodCard({
  label, value, highlight,
}: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={
        "rounded-lg border p-3 " +
        (highlight ? "border-primary/30 bg-primary/5" : "")
      }
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{currencyFormatter.format(value)}</p>
    </div>
  );
}

function TotalCard({
  icon, label, value, strong,
}: { icon?: React.ReactNode; label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={(strong ? "text-xl font-bold" : "text-lg font-semibold") + " mt-1 tabular-nums"}>
        {currencyFormatter.format(value)}
      </p>
    </div>
  );
}