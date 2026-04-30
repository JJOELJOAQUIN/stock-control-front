"use client";

import { ChevronLeft, ChevronRight, ListX } from "lucide-react";
import type { CashMovementResponse, PageResponse } from "../../types/cash.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Empty } from "@/shared/components/ui/empty";
import { Button } from "@/shared/components/ui/button";



type Props = {
  data?: PageResponse<CashMovementResponse>;
  isLoading: boolean;
  page: number;
  setPage: (value: number) => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export function CashTable({ data, isLoading, page, setPage }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimientos de caja</CardTitle>
          <CardDescription>Historial de ingresos y egresos</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos de caja</CardTitle>
        <CardDescription>Historial de ingresos y egresos</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Fecha</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Origen</TableHead>
                <TableHead className="font-semibold">Método</TableHead>
                <TableHead className="text-right font-semibold">Bruto</TableHead>
                <TableHead className="text-right font-semibold">Retención</TableHead>
                <TableHead className="text-right font-semibold">Neto</TableHead>
                <TableHead className="text-right font-semibold">Médica</TableHead>
                <TableHead className="text-right font-semibold">Cosmetóloga</TableHead>
                <TableHead className="font-semibold">Comentario</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.content?.map((item) => (
                <TableRow
                  key={item.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={item.type === "OUT" ? "destructive" : "default"}
                      className={
                        item.type === "IN"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400"
                          : ""
                      }
                    >
                      {item.type === "IN" ? "Ingreso" : "Egreso"}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-medium">{item.source}</TableCell>

                  <TableCell>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      {item.paymentMethod}
                    </span>
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(Number(item.amount))}
                  </TableCell>

                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCurrency(Number(item.retention))}
                  </TableCell>

                  <TableCell className="text-right tabular-nums font-semibold">
                    {formatCurrency(Number(item.netAmount))}
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {item.doctorShare != null
                      ? formatCurrency(Number(item.doctorShare))
                      : "-"}
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {item.cosmetologistShare != null
                      ? formatCurrency(Number(item.cosmetologistShare))
                      : "-"}
                  </TableCell>

                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {item.comment || "-"}
                  </TableCell>
                </TableRow>
              ))}

              {!data?.content?.length && (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Empty>
                      <ListX className="size-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        No hay movimientos de caja
                      </p>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.totalPages > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página{" "}
              <span className="font-medium text-foreground">
                {data.number + 1}
              </span>{" "}
              de{" "}
              <span className="font-medium text-foreground">
                {Math.max(data.totalPages, 1)}
              </span>{" "}
              · {data.totalElements} resultados
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.first}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.last}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
