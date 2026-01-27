import React, { useState } from "react";
import { AlertCircle, ChevronRight } from "lucide-react";

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
} from "./tooltip";
import TableSkeleton from "./skeleton/table-skeleton";

type Column<T> = {
  field: keyof T | string;
  headerName: string;
  render?: (value: any, row: T) => React.ReactNode;
};

type CollapsibleTableWrapperProps<T> = {
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
  expandedContent?: (row: T) => React.ReactNode;
  defaultExpanded?: boolean;
  expandedRowClassName?: string;
};

function CollapsibleTableWrapper<T>({
  columns,
  rows,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  enablePagination = true,
  isLoading = false,
  isError = false,
  totalCount = 0,
  onRetry,
  rowTooltip,

  emptyMessage = "No hay datos disponibles",
  errorMessage = "Ocurrió un error al cargar los datos",
  className,
  expandedContent,
  defaultExpanded = false,
  expandedRowClassName,
}: CollapsibleTableWrapperProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(
    defaultExpanded ? new Set(rows.map((_, idx) => idx)) : new Set()
  );

  const toggleRow = (rowIndex: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) newSet.delete(rowIndex);
      else newSet.add(rowIndex);
      return newSet;
    });
  };

  const paginatedRows = rows;
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, totalCount);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="
    hover:bg-primary
    text-primary-foreground
    bg-[linear-gradient(90deg,#da291c_3.17%,#b52217_100%)]
  
  ">
              {expandedContent && <TableHead className="w-12 text-primary-foreground font-semibold" />}
              {columns.map((col, idx) => (
                <TableHead key={idx} className="text-primary-foreground font-semibold">
                  {col.headerName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeleton
                rows={rowsPerPage}
                columns={columns}
                hasExpander={!!expandedContent}
              />
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (expandedContent ? 1 : 0)}
                  className="h-24"
                >
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
                  colSpan={columns.length + (expandedContent ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    {emptyMessage}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, rowIndex) => {
                const isExpanded = expandedRows.has(rowIndex);

                return (
                  <React.Fragment key={rowIndex}>
                    {/* ROW PRINCIPAL */}
                    <TableRow
                      className={cn(
                        "transition-colors cursor-pointer hover:bg-muted/50",
                        rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isExpanded) toggleRow(rowIndex);
                        onRowClick?.(row);
                      }}
                    >
                      {expandedContent && (
                        <TableCell className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();


                              if (!isExpanded) {
                                toggleRow(rowIndex);
                              } else {
                                toggleRow(rowIndex);
                              }


                              onRowClick?.(row);
                            }}
                            className="h-8 w-8 p-0"
                          >

                            <ChevronRight
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded && "rotate-90"
                              )}
                            />
                          </Button>
                        </TableCell>
                      )}

                      {columns.map((col, colIndex) => {
                        const value = row[col.field as keyof T];
                        const content = col.render
                          ? col.render(value, row)
                          : (value as React.ReactNode) ?? "";

                        return (
                          <TableCell
                            key={colIndex}
                            className="py-3"
                            onClick={() => onRowClick?.(row)}
                          >
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

                    {/* ROW EXPANDIDA - SIN CLICK, SIN INTERFERENCIA */}
                    {expandedContent && (
                      <TableRow
                        className={cn(
                          "bg-muted/30",
                          expandedRowClassName,
                          !isExpanded && "hidden"
                        )}
                      >
                        <TableCell
                          colSpan={columns.length + 1}
                          className="py-0 overflow-hidden pointer-events-none"
                        >
                          <div
                            className={cn(
                              "grid transition-all duration-300 ease-in-out",
                              isExpanded
                                ? "grid-rows-[1fr] opacity-100 py-4"
                                : "grid-rows-[0fr] opacity-0"
                            )}
                          >
                            {isExpanded && (
                              <div className="overflow-hidden pointer-events-auto">
                                {expandedContent(row)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      {enablePagination && !isLoading && !isError && totalCount > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Filas por página:</p>
            <select
              value={rowsPerPage}
              onChange={(e) =>
                onRowsPerPageChange?.(Number(e.target.value))
              }
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

export default CollapsibleTableWrapper;
