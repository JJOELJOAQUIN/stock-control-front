import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, ShoppingCart } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useCashConsultorioPage } from "../hooks/useCashConsultorioPage";
import { CashSummary } from "./components/CashSummary";
import { ProcedureIncomeCard } from "./components/ProcedureIncomeCard";
import { ExpenseCard } from "./components/ExpenseCard";
import { CashTable } from "./components/CashTable";
import {
  COSMETOLOGIA_PROCEDURES,
  MEDICA_PROCEDURES,
} from "../types/cash.types";
import { InlineProductSaleCard } from "./components/InlineProductSaleCards";
import { PurchaseDialog } from "@/features/stock/components/PurchaseDialog";
import { DailySplitSummary } from "./components/DailySplitSummary";
import { ProductExpirationAlerts } from "./components/ProductExpirationAlerts";

export default function CajaConsultorioPage() {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  const {
    data,
    page,
    setPage,
    isLoading,
    isCreating,
    isScanning,
    isSellingProduct,
    summary,
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

  } = useCashConsultorioPage();




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
                <Building2 className="h-5 w-5 text-primary" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Caja Consultorio
              </h1>
            </div>

            <p className="text-muted-foreground">
              Ingresos por procedimientos y movimientos de caja
            </p>
          </div>
        </div>

        <DailySplitSummary
          date={splitDate}
          setDate={setSplitDate}
          netIncome={Number(dailySplit?.netIncome ?? 0)}
          doctorTotal={Number(dailySplit?.doctorTotal ?? 0)}
          cosmetologistTotal={Number(dailySplit?.cosmetologistTotal ?? 0)}
          isLoading={isLoadingDailySplit}
        />

        <ProductExpirationAlerts
          items={expiringProducts}
          isLoading={isLoadingExpiringProducts}
        />


        <div className="flex flex-col gap-6">
          <CashSummary
            income={summary.income}
            expense={summary.expense}
            net={summary.netIncome - summary.netExpense}
          />

          <InlineProductSaleCard
            scannedProduct={scannedProduct}
            barcodeQuery={barcodeQuery}
            setBarcodeQuery={setBarcodeQuery}
            isScanning={isScanning}
            isSelling={isSellingProduct}
            onScan={scanProduct}
            onSell={sellProductFromCash}
          />

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsPurchaseOpen(true)}
          >
            <ShoppingCart className="size-4" />
            Registrar compra de productos
          </Button>

          <PurchaseDialog
            open={isPurchaseOpen}
            onOpenChange={setIsPurchaseOpen}
            products={products}
            isSubmitting={isPurchasingProduct}
            onSubmit={purchaseProductFromCash}
          />

          <ProcedureIncomeCard
            title="Ingresos cosmetología"
            description="Registrar procedimientos de cosmetología"
            procedures={COSMETOLOGIA_PROCEDURES}
            doctorSharePercent={0.3}
            cosmetologistSharePercent={0.7}
            isSubmitting={isCreating}
            variant="cosmetologia"
            onSubmit={registerProcedureIncome}
          />

          <ProcedureIncomeCard
            title="Ingresos médica"
            description="Registrar procedimientos médicos"
            procedures={MEDICA_PROCEDURES}
            doctorSharePercent={1}
            cosmetologistSharePercent={0}
            isSubmitting={isCreating}
            variant="medica"
            onSubmit={registerProcedureIncome}
          />

          <ExpenseCard isSubmitting={isCreating} onSubmit={registerExpense} />


          <CashTable
            data={data}
            isLoading={isLoading}
            page={page}
            setPage={setPage}
          />
        </div>
      </div>
    </div>

  );
}