import {
  useGetExpiringProductBatchesQuery,
  useGetProductsWithStockQuery,
} from "@/features/stock/api/stockApi";
import { LowStockCard } from "@/features/stock/components/LowStockCard";
import { ProductExpirationAlerts } from "@/features/caja/ui/components/ProductExpirationAlerts";

/**
 * Alertas de inventario en un solo lugar: bajo minimo y proximos a vencer.
 * Los datos salen del mismo cache de RTK que usan stock y caja, asi que
 * abrir esta pagina no dispara fetches nuevos si ya se navego por ahi.
 */
export default function StockAlertasPage() {
  const { data: products = [] } = useGetProductsWithStockQuery({
    context: "CONSULTORIO",
  });

  const { data: expiring = [], isLoading: isLoadingExpiring } =
    useGetExpiringProductBatchesQuery({
      context: "CONSULTORIO",
      days: 120,
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Stock bajo y vencimientos
        </h1>
        <p className="text-sm text-muted-foreground">
          Lo que hay que reponer y lo que hay que usar antes de que venza.
        </p>
      </div>

      <LowStockCard products={products} />

      <ProductExpirationAlerts items={expiring} isLoading={isLoadingExpiring} />
    </div>
  );
}