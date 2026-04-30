
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import type { PageResponse, StockMovementItem } from "../ui/types/movements.types";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  FileBarChart,
} from "lucide-react";

type Props = {
  data?: PageResponse<StockMovementItem>;
  isLoading: boolean;
  page: number;
  setPage: (value: number) => void;
};

const TYPE_CONFIG = {
  IN: {
    label: "Entrada",
    icon: ArrowDownCircle,
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  OUT: {
    label: "Salida",
    icon: ArrowUpCircle,
    className:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800",
  },
  ADJUST: {
    label: "Ajuste",
    icon: RefreshCw,
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800",
  },
} as const;

const REASON_LABELS: Record<string, string> = {
  COMPRA_PROVEEDOR: "Compra a proveedor",
  VENTA: "Venta",
  AJUSTE_ERROR: "Ajuste por error",
  DEVOLUCION: "Devolucion",
  MERMA: "Merma",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MovementsTable({ data, isLoading, page, setPage }: Props) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  const hasData = data?.content && data.content.length > 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Historial de Movimientos
            </CardTitle>
            {data && (
              <p className="text-sm text-muted-foreground">
                {data.totalElements} movimiento
                {data.totalElements !== 1 ? "s" : ""} encontrado
                {data.totalElements !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasData ? (
          <>
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Motivo</TableHead>
                    <TableHead className="text-right font-semibold">
                      Cantidad
                    </TableHead>
                    <TableHead className="font-semibold">Contexto</TableHead>
                    <TableHead className="font-semibold">Comentario</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.content.map((movement) => {
                    const typeConfig = TYPE_CONFIG[movement.type];
                    const TypeIcon = typeConfig.icon;

                    return (
                      <TableRow
                        key={movement.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="text-sm font-medium">
                          {formatDate(movement.createdAt)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1.5 ${typeConfig.className}`}
                          >
                            <TypeIcon className="h-3.5 w-3.5" />
                            {typeConfig.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm">
                          {REASON_LABELS[movement.reasonType] ||
                            movement.reasonType}
                        </TableCell>

                        <TableCell className="text-right">
                          <span
                            className={`tabular-nums font-semibold ${
                              movement.type === "IN"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : movement.type === "OUT"
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {movement.type === "IN"
                              ? "+"
                              : movement.type === "OUT"
                                ? "-"
                                : ""}
                            {movement.quantity}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {movement.context}
                          </Badge>
                        </TableCell>

                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {movement.comment || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Pagina{" "}
                <span className="font-medium text-foreground">
                  {data.number + 1}
                </span>{" "}
                de{" "}
                <span className="font-medium text-foreground">
                  {Math.max(data.totalPages, 1)}
                </span>
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.first}
                  onClick={() => setPage(page - 1)}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.last}
                  onClick={() => setPage(page + 1)}
                  className="gap-1.5"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Empty className="py-12">
            <EmptyMedia variant="icon" className="h-12 w-12">
              <FileBarChart className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Sin movimientos</EmptyTitle>
            <EmptyDescription>
              No hay movimientos para los filtros seleccionados. Intenta ajustar los criterios de busqueda.
            </EmptyDescription>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
