import { useState } from "react";

import { InlineProductSaleCard } from "./components/InlineProductSaleCards";
import { CombinedSaleDialog } from "./components/CombinedSaleDialog";
import type { SaleDraftLine } from "./components/ProductSaleDialog";
import { useCashConsultorioPage } from "../hooks/useCashConsultorioPage";
import { useProcedureOptions } from "../hooks/useProcedureOptions";

/**
 * Venta directa (escanear y cobrar) como seccion propia. Conserva el puente
 * "Agregar otro producto": si la venta crece, pasa al carrito de la
 * combinada sin volver a empezar.
 */
export default function VentaDirectaPage() {
  const [combinedOpen, setCombinedOpen] = useState(false);
  const [seedLines, setSeedLines] = useState<SaleDraftLine[]>([]);

  const {
    barcodeQuery,
    setBarcodeQuery,
    scannedProduct,
    scanProduct,
    clearScannedProduct,
    isScanning,
    isSellingProduct,
    sellProductFromCash,
    nameResults,
    selectProductByName,
    products,
  } = useCashConsultorioPage();

  const { all: allProcedures } = useProcedureOptions();

  const handleAddMore = (draft: SaleDraftLine) => {
    setSeedLines([draft]);
    clearScannedProduct();
    setCombinedOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Venta directa</h1>
        <p className="text-sm text-muted-foreground">
          Escanea o busca el producto y registra la venta al toque.
        </p>
      </div>

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
        onAddMore={handleAddMore}
      />

      <CombinedSaleDialog
        open={combinedOpen}
        onOpenChange={(o) => {
          setCombinedOpen(o);
          if (!o) setSeedLines([]);
        }}
        context="CONSULTORIO"
        products={products}
        procedures={allProcedures}

        seedLines={seedLines}
      />
    </div>
  );
}