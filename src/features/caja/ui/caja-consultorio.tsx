import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
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
import { InlineProductPurchaseCard } from "./components/InlinePurchaseCard";

export default function CajaConsultorioPage() {


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
    isPurchasingProduct

  } = useCashConsultorioPage();

  return (
    <main className="min-h-full bg-background text-foreground space-y-6">
      <header className="flex items-center gap-4">
        <Link to="/inicio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Caja Consultorio</h1>
          <p className="text-muted-foreground">
            Ingresos por procedimientos y movimientos de caja
          </p>
        </div>

        <Badge variant="outline">Contexto: CONSULTORIO</Badge>
      </header>

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

      <InlineProductPurchaseCard
        products={products}
        isSubmitting={isPurchasingProduct}
        onPurchase={purchaseProductFromCash}
      />

      <ProcedureIncomeCard
        title="Ingresos cosmetología"
        description="Registrar procedimientos de cosmetología"
        procedures={COSMETOLOGIA_PROCEDURES}
        doctorSharePercent={0.30}
        cosmetologistSharePercent={0.70}
        isSubmitting={isCreating}
        onSubmit={registerProcedureIncome}
      />

      <ProcedureIncomeCard
        title="Ingresos médica"
        description="Registrar procedimientos médicos"
        procedures={MEDICA_PROCEDURES}
        doctorSharePercent={1}
        cosmetologistSharePercent={0}
        isSubmitting={isCreating}
        onSubmit={registerProcedureIncome}
      />

      <ExpenseCard
        isSubmitting={isCreating}
        onSubmit={registerExpense}
      />

      <CashTable
        data={data}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
      />
    </main>
  );
}