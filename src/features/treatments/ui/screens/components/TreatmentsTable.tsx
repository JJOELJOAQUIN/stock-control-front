// features/treatments/ui/components/TreatmentsTable.tsx
import { ListX } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Empty } from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { currencyFormatter } from "@/lib/currencyFormatter";
import type { Treatment, TreatmentStatus } from "../models/treatment";


const STATUS: Record<TreatmentStatus, { label: string; className: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    className:
      "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400",
  },
  PARCIALMENTE_PAGADO: {
    label: "Parcial",
    className:
      "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400",
  },
  PAGADO: {
    label: "Pagado",
    className:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

type Props = {
  treatments: Treatment[];
  isLoading: boolean;
};

export function TreatmentsTable({ treatments, isLoading }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Fecha</TableHead>
            <TableHead className="font-semibold">Paciente</TableHead>
            <TableHead className="font-semibold">Procedimiento</TableHead>
            <TableHead className="text-right font-semibold">Total</TableHead>
            <TableHead className="text-right font-semibold">Pagado</TableHead>
            <TableHead className="text-right font-semibold">Pendiente</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="text-center font-semibold">Pagos</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                <TableCell colSpan={8}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading &&
            treatments.map((t) => {
              const status = STATUS[t.status];
              return (
                <TableRow key={t.id} className="hover:bg-muted/30">
                  <TableCell className="text-muted-foreground">
                    {formatDate(t.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {t.patient
                      ? `${t.patient.firstName} ${t.patient.lastName}`
                      : "-"}
                  </TableCell>
                  <TableCell>{t.procedureLabel ?? t.procedureCode}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currencyFormatter.format(Number(t.totalAmount))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currencyFormatter.format(Number(t.paidAmount))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {currencyFormatter.format(Number(t.pendingAmount))}
                  </TableCell>
                  <TableCell>
                    <Badge className={status.className}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {t.payments?.length ?? 0}
                  </TableCell>
                </TableRow>
              );
            })}

          {!isLoading && treatments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Empty>
                  <ListX className="size-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Todavía no hay tratamientos registrados
                  </p>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}