import { Banner } from "@/shared/components/ui/banner";
import StatCard from "@/shared/components/ui/charts/stat-card/stat-card";
import { useDecodedJwt } from "@/core/auth/hooks/useDecodedJwt";
import { useDashboardHome } from "../services/useDashboardHome";

import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const Home = () => {
  const user = useDecodedJwt();
  const { summary, cash, isLoading } = useDashboardHome();

  if (isLoading) return <div>Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      <Banner
        title={`Bienvenido ${user?.name ?? "Usuario"}`}
        description="Resumen general del sistema"
      />

      {/* STOCK */}
      <section>
        <h3 className="text-lg font-bold mb-2">Stock</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Productos" value={summary?.totalProducts ?? 0} icon={<Boxes />} />
          <StatCard title="Con stock" value={summary?.productsWithStock ?? 0} icon={<PackageCheck />} />
          <StatCard title="Sin stock" value={summary?.productsWithoutStock ?? 0} icon={<AlertTriangle />} />
          <StatCard title="Bajo mínimo" value={summary?.lowStock ?? 0} icon={<AlertTriangle />} />
        </div>
      </section>

      {/* CAJA */}
      <section>
        <h3 className="text-lg font-bold mb-2">Caja</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Ingresos" value={cash?.totalIn ?? 0} icon={<TrendingUp />} />
          <StatCard title="Egresos" value={cash?.totalOut ?? 0} icon={<TrendingDown />} />
          <StatCard title="Retenciones" value={cash?.totalRetention ?? 0} icon={<Wallet />} />
          <StatCard title="Neto" value={cash?.netTotal ?? 0} icon={<Wallet />} />
        </div>
      </section>
    </div>
  );
};

export default Home;
