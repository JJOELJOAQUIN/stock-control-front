import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-full bg-background text-foreground space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/inicio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Movimientos</h1>
          <p className="text-muted-foreground">
            Historial de movimientos de stock por producto
          </p>
        </div>

        <Badge variant="outline">
          Contexto actual: {context ?? "Sin seleccionar"}
        </Badge>
      </div>

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

      <MovementsTable
        data={canQuery ? data : undefined}
        isLoading={canQuery ? isLoading : false}
        page={page}
        setPage={setPage}
      />
    </div>
  );
}