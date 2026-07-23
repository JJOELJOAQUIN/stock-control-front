import { useMemo, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, ListX, Search, X } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

const ALL = "ALL";

const SOURCE_LABELS: Record<CashSource, string> = {
  PRODUCT_SALE: "Venta de producto",
  PROCEDURE: "Procedimiento",
  EXPENSE: "Egreso",
  PROVIDER_PAYMENT: "Pago a proveedor",
  ADJUSTMENT: "Ajuste",
};

// Definición de columnas: key, label, ancho por defecto, alineación y ancho mínimo.
type ColKey =
  | "date"
  | "type"
  | "source"
  | "method"
  | "amount"
  | "retention"
  | "net"
  | "doctor"
  | "cosmetologist"
  | "comment"
  | "actions";

const COLUMNS: {
  key: ColKey;
  label: string;
  width: number;
  min: number;
  align?: "left" | "right";
}[] = [
  { key: "date", label: "Fecha", width: 150, min: 120 },
  { key: "type", label: "Tipo", width: 110, min: 90 },
  { key: "source", label: "Origen", width: 210, min: 140 },
  { key: "method", label: "Método", width: 120, min: 90 },
  { key: "amount", label: "Bruto", width: 120, min: 90, align: "right" },
  // { key: "retention", label: "Retención", width: 120, min: 90, align: "right" },
  { key: "net", label: "Neto", width: 120, min: 90, align: "right" },
  { key: "doctor", label: "Médica", width: 120, min: 90, align: "right" },
  { key: "cosmetologist", label: "Cosmetóloga", width: 130, min: 100, align: "right" },
  { key: "comment", label: "Comentario", width: 240, min: 140 },
  { key: "actions", label: "", width: 70, min: 60 },
];

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

  // Anulación: si viene, cada fila viva muestra el botón. Las anuladas quedan
  // tachadas y sin botón — anular dos veces no existe.
  onVoid?: (movement: CashMovementResponse) => void;

  // Permite redimensionar columnas arrastrando el borde derecho del encabezado.
  resizable?: boolean;
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

const getDetailLines = (detail?: string | null) =>
  detail
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean) ?? [];

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
  onVoid,
  resizable = true,
}: Props) {
  // Anchos de columna controlados (para redimensionar).
  const [colWidths, setColWidths] = useState<Record<ColKey, number>>(() =>
    COLUMNS.reduce(
      (acc, c) => ({ ...acc, [c.key]: c.width }),
      {} as Record<ColKey, number>,
    ),
  );

  const handleResize = (key: ColKey, min: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[key];

    const onMove = (ev: PointerEvent) => {
      const next = Math.max(min, startWidth + (ev.clientX - startX));
      setColWidths((prev) => ({ ...prev, [key]: next }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
    };

    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Lo más reciente primero, lo más viejo al final.
  const rows = useMemo(() => {
    const content = data?.content ?? [];
    return [...content].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data]);

  const totalWidth = COLUMNS.reduce((sum, c) => sum + colWidths[c.key], 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos de caja</CardTitle>
        <CardDescription>
          Historial de ingresos y egresos (más recientes primero)
        </CardDescription>
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
          <Table
            className="table-fixed"
            style={{ width: totalWidth, minWidth: "100%" }}
          >
            <colgroup>
              {COLUMNS.map((c) => (
                <col key={c.key} style={{ width: colWidths[c.key] }} />
              ))}
            </colgroup>

            <TableHeader>
              <TableRow className="bg-muted/50">
                {COLUMNS.map((c) => (
                  <TableHead
                    key={c.key}
                    className={`relative select-none font-semibold ${
                      c.align === "right" ? "text-right" : ""
                    }`}
                  >
                    <span className="block truncate">{c.label}</span>

                    {resizable && (
                      <span
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Redimensionar columna ${c.label}`}
                        onPointerDown={handleResize(c.key, c.min)}
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none border-r-2 border-transparent hover:border-primary/60"
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={COLUMNS.length}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading &&
                rows.map((item) => (
                  <TableRow
                    key={item.id}
                    className={
                      item.voided
                        ? "bg-muted/40 text-muted-foreground line-through opacity-60"
                        : "transition-colors hover:bg-muted/30"
                    }
                    title={
                      item.voided
                        ? `Anulado por ${item.voidedBy ?? "?"}: ${item.voidReason ?? ""}`
                        : undefined
                    }
                  >
                    <TableCell className="truncate text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.type === "IN"
                            ? "border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "border-red-500/60 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {item.type === "IN" ? "Ingreso" : "Egreso"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex min-w-0 flex-col">
                        {item.detail ? (() => {
                          const detailLines = getDetailLines(item.detail);
                          const firstDetail = detailLines[0] ?? item.detail.trim();

                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate font-medium text-foreground">
                                  {firstDetail}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs whitespace-pre-line text-left">
                                {item.detail}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })() : (
                          <span className="truncate font-medium">
                            {SOURCE_LABELS[item.source] ?? item.source}
                          </span>
                        )}

                        {item.detail && (() => {
                          const detailLines = getDetailLines(item.detail);
                          const hasMoreDetails = detailLines.length > 1;

                          return hasMoreDetails ? (
                            <span className="truncate text-xs text-muted-foreground">
                              +{detailLines.length - 1} más
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </TableCell>

                    <TableCell className="truncate">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {item.paymentMethod}
                      </span>
                    </TableCell>

                    <TableCell className="truncate text-right tabular-nums">
                      {formatCurrency(Number(item.amount))}
                    </TableCell>

                    {/* <TableCell className="truncate text-right tabular-nums text-muted-foreground">
                      {formatCurrency(Number(item.retention))}
                    </TableCell> */}

                    <TableCell className="truncate text-right font-semibold tabular-nums">
                      {formatCurrency(Number(item.netAmount))}
                    </TableCell>

                    <TableCell className="truncate text-right tabular-nums">
                      {item.doctorShare != null
                        ? formatCurrency(Number(item.doctorShare))
                        : "-"}
                    </TableCell>

                    <TableCell className="truncate text-right tabular-nums">
                      {item.cosmetologistShare != null
                        ? formatCurrency(Number(item.cosmetologistShare))
                        : "-"}
                    </TableCell>

                    <TableCell className="truncate text-muted-foreground">
                      {item.voided ? (
                        // El motivo va acá y no en una columna nueva: es lo
                        // primero que se busca cuando alguien pregunta "¿y
                        // esto por qué está tachado?".
                        <span className="flex min-w-0 flex-col no-underline">
                          <span className="truncate">{item.comment || "-"}</span>
                          <span className="truncate text-xs text-destructive/80">
                            Anulado{item.voidedBy ? ` por ${item.voidedBy}` : ""}
                            {item.voidReason ? `: ${item.voidReason}` : ""}
                          </span>
                        </span>
                      ) : (
                        item.comment || "-"
                      )}
                    </TableCell>

                    <TableCell>
                      {onVoid && !item.voided && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Anular movimiento"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onVoid(item)}
                        >
                          <Ban className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && !rows.length && (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length}>
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