import { ListX, Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Empty } from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { currencyFormatter } from "@/lib/currencyFormatter";
import type { Treatment, TreatmentStatus } from "../models/treatment";

const STATUS: Record<TreatmentStatus, { label: string; className: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
  PARCIAL: {
    label: "Parcial",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  COMPLETO: {
    label: "Completo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
};

type Props = {
  treatments: Treatment[];
  isLoading: boolean;
  canRegister: boolean;
  onAddPayment: (treatment: Treatment) => void;
};

export function TreatmentsTable({ treatments, isLoading, canRegister, onAddPayment }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Paciente</TableHead>
            <TableHead className="font-semibold">Procedimiento</TableHead>
            <TableHead className="text-right font-semibold">Total</TableHead>
            <TableHead className="text-right font-semibold">Pagado</TableHead>
            <TableHead className="text-right font-semibold">Pendiente</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="text-center font-semibold">Pagos</TableHead>
            {canRegister && <TableHead className="text-right font-semibold">Acción</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                <TableCell colSpan={canRegister ? 8 : 7}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading &&
            treatments.map((t) => {
              const status = STATUS[t.status];
              const canPay = t.status !== "COMPLETO" && t.paymentsCount < t.maxInstallments;
              return (
                <TableRow key={t.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{t.patientName}</TableCell>
                  <TableCell>{t.description ?? t.code}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currencyFormatter.format(Number(t.totalAmount))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currencyFormatter.format(Number(t.paidAmount))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {currencyFormatter.format(Number(t.remainingAmount))}
                  </TableCell>
                  <TableCell>
                    <Badge className={status.className}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {t.paymentsCount}/{t.maxInstallments}
                  </TableCell>
                  {canRegister && (
                    <TableCell className="text-right">
                      {canPay && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => onAddPayment(t)}>
                          <Plus className="size-3.5" />
                          Pago
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}

          {!isLoading && treatments.length === 0 && (
            <TableRow>
              <TableCell colSpan={canRegister ? 8 : 7}>
                <Empty>
                  <ListX className="size-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Todavía no hay tratamientos registrados</p>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}