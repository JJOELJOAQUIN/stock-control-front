import type { CashMovementResponse } from "@/features/caja/types/cash.types";
import { CashTable } from "@/features/caja/ui/components/CashTable";
import { VoidMovementDialog } from "@/features/caja/ui/components/VoidMovementDialog";
import { useState } from "react";
import { useCashConsultorioPage } from "../../caja/hooks/useCashConsultorioPage.ts"


/**
 * Página de movimientos: SOLO la tabla y la anulación. Todo lo demás que
 * vivía acá se mudó a sus propias secciones. Los datos salen del mismo
 * caché de RTK que usa la caja, así que no hay fetch duplicado: esta página
 * y la caja miran la misma verdad.
 */
export default function MovimientosConsultorioPage() {
  const [voidTarget, setVoidTarget] = useState<CashMovementResponse | null>(null);

  const {
    data,
    page,
    setPage,
    isLoading,
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
    voidMovement,
    isVoiding,
  } = useCashConsultorioPage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Movimientos consultorio
        </h1>
        <p className="text-sm text-muted-foreground">
          Historial completo de caja. Los anulados quedan tachados con su motivo.
        </p>
      </div>

      <CashTable
        data={data}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        commentQuery={commentQuery}
        setCommentQuery={setCommentQuery}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        onVoid={setVoidTarget}
      />

      <VoidMovementDialog
        movement={voidTarget}
        onOpenChange={(o) => !o && setVoidTarget(null)}
        onConfirm={voidMovement}
        isVoiding={isVoiding}
      />
    </div>
  );
}