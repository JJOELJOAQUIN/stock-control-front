"use client";

import { ChevronLeft, ChevronRight, ListX, Search, X } from "lucide-react";
import type {
  CashMovementResponse,
  CashMovementType,
  CashSource,
  PageResponse,
} from "../../types/cash.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Empty } from "@/shared/components/ui/empty";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const ALL = "ALL";

const SOURCE_LABELS: Record<CashSource, string> = {
  PRODUCT_SALE: "Venta de producto",
  PROCEDURE: "Procedimiento",
  EXPENSE: "Egreso",
  PROVIDER_PAYMENT: "Pago a proveedor",
  ADJUSTMENT: "Ajuste",
};

type Props = {
  data?: PageResponse<CashMovementResponse>;
  isLoading: boolean;
  page: number;
  setPage: (value: number) => void;

  // Filtros (server-side)
  typeFilter?: CashMovementType;
  setTypeFilter: (value: CashMovementType | undefined) => void;
  sourceFilter?: CashSource;
  setSourceFilter: (value: CashSource | undefined) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  commentQuery: string;
  setCommentQuery: (value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
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

export function CashTable({
  data,
  isLoading,
  page,
  setPage,
  typeFilter,
  setTypeFilter,
  sourceFilter,
  setSourceFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  commentQuery,
  setCommentQuery,
  clearFilters,
  hasActiveFilters,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos de caja</CardTitle>
        <CardDescription>Historial de ingresos y egresos</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tipo</span>
            <Select
              value={typeFilter ?? ALL}
              onValueChange={(v) =>
                setTypeFilter(v === ALL ? undefined : (v as CashMovementType))
              }
            >
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                <SelectItem value="IN">Ingreso</SelectItem>
                <SelectItem value="OUT">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Origen */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Origen</span>
            <Select
              value={sourceFilter ?? ALL}
              onValueChange={(v) =>
                setSourceFilter(v === ALL ? undefined : (v as CashSource))
              }
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {(Object.keys(SOURCE_LABELS) as CashSource[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {SOURCE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desde */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Desde</span>
            <Input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full lg:w-40"
            />
          </div>

          {/* Hasta */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Hasta</span>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full lg:w-40"
            />
          </div>

          {/* Comentario / detalle */}
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Comentario o detalle
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={commentQuery}
                onChange={(e) => setCommentQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-9"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="gap-2 text-muted-foreground"
            >
              <X className="size-4" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Tabla */}
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
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={10}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading &&
                data?.content?.map((item) => (
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

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {SOURCE_LABELS[item.source] ?? item.source}
                        </span>
                        {item.detail && (
                          <span className="text-xs text-muted-foreground">
                            {item.detail}
                          </span>
                        )}
                      </div>
                    </TableCell>

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

              {!isLoading && !data?.content?.length && (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Empty>
                      <ListX className="size-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {hasActiveFilters
                          ? "No hay movimientos para los filtros aplicados"
                          : "No hay movimientos de caja"}
                      </p>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.totalPages > 0 && (
          <div className="flex items-center justify-between">
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