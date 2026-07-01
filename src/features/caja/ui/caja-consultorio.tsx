import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, ShoppingCart } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useCashConsultorioPage } from "../hooks/useCashConsultorioPage";
// import { CashSummary } from "./components/CashSummary";
import { ProcedureIncomeCard } from "./components/ProcedureIncomeCard";
import { ExpenseCard } from "./components/ExpenseCard";
import { CashTable } from "./components/CashTable";
import { InlineProductSaleCard } from "./components/InlineProductSaleCards";
import { PurchaseDialog } from "@/features/stock/components/PurchaseDialog";
import { DailySplitSummary } from "./components/DailySplitSummary";
import { CosmetologistSplitCard } from "./components/CosmetologistSplitCard";
import { ProductExpirationAlerts } from "./components/ProductExpirationAlerts";
import { BusinessTotals } from "./components/BusinessTotals";
import { COSMETOLOGIA_PROCEDURES, MEDICA_PROCEDURES } from "../types/cash.types";
import { useHasRole } from "@/features/auth/hooks/useRoles";
import { RoleGate } from "@/features/auth/ui/RoleGate";


// Repartos por especialidad (doctor / cosmetóloga).
const COSMETOLOGIA_SHARE = { doctor: 0.3, cosmetologist: 0.7 } as const;
const MEDICA_SHARE = { doctor: 1, cosmetologist: 0 } as const;

export default function CajaConsultorioPage() {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

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
    isCreating,
    isScanning,
    isSellingProduct,
    // summary,
    barcodeQuery,
    setBarcodeQuery,
    scannedProduct,
    scanProduct,
    sellProductFromCash,
    registerProcedureIncome,
    registerExpense,
    products,
    purchaseProductFromCash,
    isPurchasingProduct,
    splitDate,
    setSplitDate,
    dailySplit,
    isLoadingDailySplit,
    expiringProducts,
    isLoadingExpiringProducts,
    salesTotals,
    stockValue,
    nameResults,
    selectProductByName,
  } = useCashConsultorioPage();

  // Permisos de UI: COSMETOLOGA no ve KPIs/costos, neto, ni registra compras.
  const canViewFinancials = useHasRole(["ADMIN", "USER"]);
  // La médica (ADMIN) no ve el card de procedimientos de cosmetología.
  const showCosmetologiaProcedures = useHasRole(["USER", "COSMETOLOGA"]);

  // const netCash = summary.netIncome - summary.netExpense;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="space-y-6">
        <header className="flex items-start gap-4">
          <Button asChild variant="outline" size="icon" className="h-10 w-10 shrink-0">
            <Link to="/inicio">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver al inicio</span>
            </Link>
          </Button>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                Caja Consultorio
              </h1>
            </div>
            <p className="text-muted-foreground">
              Ingresos por procedimientos y movimientos de caja
            </p>
          </div>
        </header>

        {/* Métricas del negocio */}
        <section className="space-y-6" aria-label="Resumen del negocio">
          <RoleGate allow={["ADMIN", "USER"]}>
            <BusinessTotals
              stockAtCost={stockValue?.atCost ?? 0}
              stockAtSale={stockValue?.atSale ?? 0}
              productSales={Number(salesTotals?.productSales ?? 0)}
              procedureIncome={Number(salesTotals?.procedureIncome ?? 0)}
            />
          </RoleGate>

          {canViewFinancials ? (
            <DailySplitSummary
              date={splitDate}
              setDate={setSplitDate}
              netIncome={Number(dailySplit?.netIncome ?? 0)}
              doctorTotal={Number(dailySplit?.doctorTotal ?? 0)}
              cosmetologistTotal={Number(dailySplit?.cosmetologistTotal ?? 0)}
              isLoading={isLoadingDailySplit}
              showNetIncome={canViewFinancials}
              showDoctorTotal={canViewFinancials}
            />
          ) : (
            <CosmetologistSplitCard date={splitDate} setDate={setSplitDate} />
          )}

          {/* items-stretch + h-full: el botón iguala el alto de la tarjeta de alertas */}
          {canViewFinancials ? (
            <div
              className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2"
              aria-label="Acciones de caja"
            >
              <Button
                variant="outline"
                onClick={() => setIsPurchaseOpen(true)}
                className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="size-6" />
                </span>
                <span className="text-sm font-semibold">Registrar compra de productos</span>
              </Button>

              <ProductExpirationAlerts
                items={expiringProducts}
                isLoading={isLoadingExpiringProducts}
              />
            </div>
          ) : (
            <ProductExpirationAlerts
              items={expiringProducts}
              isLoading={isLoadingExpiringProducts}
            />
          )}

          {/* El diálogo va fuera del grid: no ocupa celda ni descuadra columnas */}
          {canViewFinancials && (
            <PurchaseDialog
              open={isPurchaseOpen}
              onOpenChange={setIsPurchaseOpen}
              products={products}
              isSubmitting={isPurchasingProduct}
              onSubmit={async (order) => {
                await purchaseProductFromCash(order);
                setIsPurchaseOpen(false);
              }}
            />
          )}
        </section>

        {/* Operaciones de caja */}
        <section className="flex flex-col gap-6" aria-label="Operaciones de caja">
          {/* <CashSummary income={summary.income} expense={summary.expense} net={netCash} /> */}

          {/* items-start: cada tarjeta toma su alto natural y no se "estira" hacia abajo */}
          <div
            className="grid grid-cols-1 items-start gap-6 md:grid-cols-2"
            aria-label="Venta y egreso"
          >
            <InlineProductSaleCard
              scannedProduct={scannedProduct}
              barcodeQuery={barcodeQuery}
              setBarcodeQuery={setBarcodeQuery}
              isScanning={isScanning}
              isSelling={isSellingProduct}
              onScan={scanProduct}
              onSell={sellProductFromCash}
              nameResults={nameResults}
              onSelectByName={selectProductByName}
            />
            <ExpenseCard isSubmitting={isCreating} onSubmit={registerExpense} />
          </div>

          <div
            className={`grid grid-cols-1 items-start gap-6 ${
              showCosmetologiaProcedures ? "md:grid-cols-2" : ""
            }`}
            aria-label="Ingresos por procedimientos"
          >
            <ProcedureIncomeCard
              title="PROCEDIMIENTOS MEDICA"
              description="Registrar procedimientos médicos"
              procedures={MEDICA_PROCEDURES}
              doctorSharePercent={MEDICA_SHARE.doctor}
              cosmetologistSharePercent={MEDICA_SHARE.cosmetologist}
              isSubmitting={isCreating}
              variant="medica"
              onSubmit={registerProcedureIncome}
            />

            {showCosmetologiaProcedures && (
              <ProcedureIncomeCard
                title="PROCEDIMIENTOS COSMETOLOGIA"
                description="Registrar procedimientos de cosmetología"
                procedures={COSMETOLOGIA_PROCEDURES}
                doctorSharePercent={COSMETOLOGIA_SHARE.doctor}
                cosmetologistSharePercent={COSMETOLOGIA_SHARE.cosmetologist}
                isSubmitting={isCreating}
                variant="cosmetologia"
                onSubmit={registerProcedureIncome}
              />
            )}
          </div>

          <RoleGate allow={["ADMIN", "USER"]}>
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
            />
          </RoleGate>
        </section>
      </div>
    </div>
  );
}