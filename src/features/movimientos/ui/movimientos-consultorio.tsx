import { Link } from "react-router-dom";
import { Activity, ArrowLeft, Building2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useMovementsPage } from "../hooks/useMovementsPage";
import { MovementsFilters } from "../components/MovementsFilters";
import { MovementsTable } from "../components/MovementsTable";


export default function MovimientosConsultorioPage() {
  const {
    context,
    products,
    selectedProductId,
    setSelectedProductId,
    type,
    setType,
    reason,
    setReason,
    minQty,
    setMinQty,
    maxQty,
    setMaxQty,
    from,
    setFrom,
    to,
    setTo,
    page,
    setPage,
    data,
    isLoading,
    canQuery,
    resetFilters,
  } = useMovementsPage();

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link to="/inicio">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver al inicio</span>
            </Button>
          </Link>

           <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Movimientos de Stock
              </h1>
            </div>
            <p className="text-muted-foreground">
              Historial completo de entradas, salidas y ajustes de inventario
            </p>
          </div>

          <Badge
            variant="outline"
            className="shrink-0 gap-2 border-primary/30 bg-primary/5 px-3 py-1.5 text-primary"
          >
            <Building2 className="h-4 w-4" />
            {context ?? "Sin seleccionar"}
          </Badge>
        </div>

        {/* Filters */}
        <MovementsFilters
          products={products}
          selectedProductId={selectedProductId}
          setSelectedProductId={(value) => {
            setSelectedProductId(value);
            setPage(0);
          }}
          type={type}
          setType={(value) => {
            setType(value);
            setPage(0);
          }}
          reason={reason}
          setReason={(value) => {
            setReason(value);
            setPage(0);
          }}
          minQty={minQty}
          setMinQty={(value) => {
            setMinQty(value);
            setPage(0);
          }}
          maxQty={maxQty}
          setMaxQty={(value) => {
            setMaxQty(value);
            setPage(0);
          }}
          from={from}
          setFrom={(value) => {
            setFrom(value);
            setPage(0);
          }}
          to={to}
          setTo={(value) => {
            setTo(value);
            setPage(0);
          }}
          onReset={resetFilters}
        />

        {/* Table */}
        <MovementsTable
          data={canQuery ? data : undefined}
          isLoading={canQuery ? isLoading : false}
          page={page}
          setPage={setPage}
        />
      </div>
    </div>
  );
}