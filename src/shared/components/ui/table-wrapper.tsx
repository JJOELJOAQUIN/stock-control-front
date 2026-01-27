import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

import TableSkeleton from "./skeleton/table-skeleton";

type Column<T> = {
  field: keyof T | string;
  headerName: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  resizable?: boolean;
};

type TableWrapperProps<T> = {
  columns: Column<T>[];
  rows: T[];
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  onRowClick?: (row: T) => void;
  enablePagination?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  totalCount?: number;
  onRetry?: () => void;
  rowTooltip?: string;
  rowWrapper?: (row: T, children: React.ReactNode) => React.ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  className?: string;
};

function TableWrapper<T>({
  columns,
  rows,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  enablePagination = true,
  isLoading = true,
  isError = true,
  totalCount = 0,
  onRetry,
  rowTooltip,
  rowWrapper,
  emptyMessage = "No hay datos disponibles",
  errorMessage = "Ocurrió un error al cargar los datos",
  className,
}: TableWrapperProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, totalCount);

  // ---------- RESIZE ----------
  function startResize(e: React.MouseEvent, field: string) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[field] ?? 150;

    function onMouseMove(ev: MouseEvent) {
      const newWidth = Math.max(80, startWidth + (ev.clientX - startX));
      setColumnWidths((prev) => ({ ...prev, [field]: newWidth }));
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  // ---------- SORT ----------
  function toggleSort(field: string) {
    setSortConfig((prev) => {
      if (!prev || prev.field !== field) {
        return { field, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { field, direction: "desc" };
      }
      return null;
    });
  }

  const orderedRows = React.useMemo(() => {
    if (!sortConfig) return rows;

    const { field, direction } = sortConfig;

    return [...rows].sort((a, b) => {
      const valA = a[field as keyof T];
      const valB = b[field as keyof T];

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig]);

  // reemplaza rows por orderedRows
  const paginatedRows = orderedRows;

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow
              className="
                hover:bg-primary
                text-primary-foreground
                bg-[linear-gradient(90deg,#da291c_3.17%,#b52217_100%)]
              "
            >
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  style={{ width: columnWidths[col.field as string] ?? 150 }}
                  className="relative select-none text-primary-foreground font-semibold group"
                >
                  <div className="flex items-center justify-between">
                    {/* ------ SORT HEADER ------ */}
                    <span
                      className={cn(
                        col.sortable &&
                          "cursor-pointer select-none flex items-center gap-1"
                      )}
                      onClick={() =>
                        col.sortable && toggleSort(col.field as string)
                      }
                    >
                      {col.headerName}

                      {/* Icono según estado */}
                      {col.sortable &&
                        (sortConfig?.field === col.field ? (
                          <span className="text-xs">
                            {sortConfig.direction === "asc" ? "▲" : "▼"}
                          </span>
                        ) : (
                          <span className="text-xs opacity-40">↕</span>
                        ))}
                    </span>

                    {/* ------ RESIZE HANDLE ------ */}
                    {col.resizable && (
                      <span
                        onMouseDown={(e) => startResize(e, col.field as string)}
                        className="
                          absolute right-0 top-0 h-full w-1 cursor-col-resize
                          bg-transparent group-hover:bg-primary/40
                        "
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeleton
                columns={columns}
                hasExpander={false}
                rows={rowsPerPage}
              />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm text-muted-foreground">
                      {errorMessage}
                    </p>
                    {onRetry && (
                      <Button onClick={onRetry} variant="outline" size="sm">
                        Reintentar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    {emptyMessage}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, rowIndex) => {
                let rowContent = (
                  <TableRow
                    key={rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                    )}
                  >
                    {columns.map((col, colIndex) => {
                      const value = row[col.field as keyof T];
                      const content = col.render
                        ? col.render(value, row)
                        : (value as React.ReactNode) ?? "";

                      return (
                        <TableCell key={colIndex} className="py-3">
                          {rowTooltip ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-block w-full">
                                    {content}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{rowTooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            content
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );

                if (rowWrapper) {
                  rowContent = rowWrapper(
                    row,
                    rowContent
                  ) as React.ReactElement;
                }

                return rowContent;
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ---------------- PAGINACIÓN ---------------- */}
      {enablePagination && !isLoading && !isError && totalCount > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Filas por página:</p>
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground">
              {startIndex}-{endIndex} de {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(0)}
                disabled={page === 0}
              >
                Primera
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Siguiente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                Última
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableWrapper;
