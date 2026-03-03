import { useState } from "react";
import { BentoGrid } from "@/shared/components/bento-grid";
import { BentoNavCard, BentoStatCard, BentoSectionCard } from "@/shared/components/bento-card";
import { Input } from "@/shared/components/ui/input";
import { Package, DollarSign, Receipt, Search, TrendingUp } from "lucide-react";

export default function HomeConsultorio() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-full bg-background text-foreground space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Consultorio</h1>
          <p className="text-muted-foreground">Gestión del consultorio.</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos, movimientos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <BentoGrid>
        <BentoSectionCard
          href="/inicio/stock"
          className="col-span-1 row-span-2 sm:col-span-2 lg:col-span-2"
          icon={<Package className="h-6 w-6" />}
          title="Stock"
          description="Inventario del consultorio"
          items={["Ingresar", "Egresar", "Ver inventario"]}
        />

        <BentoNavCard
          href="/inicio/caja/consultorio"
          variant="secondary"
          icon={<DollarSign className="h-6 w-6" />}
          title="Caja Consultorio"
          description="Flujo de dinero consultorio"
        />

        <BentoNavCard
          href="/inicio/movimientos-consultorio"
          variant="gradient"
          className="col-span-1 sm:col-span-2"
          icon={<Receipt className="h-6 w-6" />}
          title="Movimientos"
          description="Registro de transacciones"
        />

        <BentoStatCard
          href="/inicio/stock"
          label="Total Productos"
          value="98"
          change="+3 esta semana"
          changePositive
          icon={<Package className="h-4 w-4" />}
        />

        <BentoStatCard
          href="/inicio/caja/consultorio"
          label="Caja Consultorio"
          value="$21,900"
          change="+2.1% vs mes anterior"
          changePositive
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </BentoGrid>
    </div>
  );
}