import {
  Package,
  DollarSign,
  Calendar,
  ArrowUpRight,
  Home,
  Receipt,
} from "lucide-react";


import { BentoGrid } from "@/shared/components/bento-grid";
import {
  BentoNavCard,
  BentoSectionCard,
  
} from "@/shared/components/bento-card";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function formatDate(): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function HomeConsultorio() {


  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Home className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {getGreeting()}
                </h1>
              </div>

              <p className="text-muted-foreground">
                Panel principal del consultorio
              </p>

              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm capitalize">{formatDate()}</span>
              </div>
            </div>
          </div>

          {/* <div className="w-full lg:w-80">
            <InputGroup>
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>

              <InputGroupInput
                placeholder="Buscar productos, movimientos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </div> */}
        </div>

        {/* Main Bento Grid */}
        <BentoGrid>
          <BentoSectionCard
            href="/inicio/stock"
            className="col-span-1 row-span-2 sm:col-span-2 lg:col-span-2"
            icon={<Package className="h-6 w-6" />}
            title="Stock"
            description="Control de inventario del consultorio"
            items={["Ingresar", "Egresar", "Inventario"]}
                   variant="brandMuted"
          />

          <BentoNavCard
            href="/inicio/caja/consultorio"
               variant="brandMuted"
            icon={<DollarSign className="h-6 w-6" />}
            title="Caja Consultorio"
            description="Flujo de dinero y pagos"
          />

          <BentoNavCard
            href="/inicio/caja/movimientos"
            variant="brandMuted"
            className="col-span-1 sm:col-span-2 lg:col-span-1"
            icon={<Receipt className="h-6 w-6" />}
            title="Movimientos Consultorio"
            description="Historial de transacciones"
          />

          {/* <BentoStatCard
            href="/inicio/stock"
            label="Total Productos"
            value="98"
            change="+3 esta semana"
            changePositive
            icon={<Package className="h-4 w-4" />}
                        variant="brandMuted"
          />

          <BentoStatCard
            href="/inicio/caja/consultorio"
            label="Caja Hoy"
            value="$21.900"
            change="+2.1% vs ayer"
            changePositive
            icon={<TrendingUp className="h-4 w-4" />}
                        variant="brandMuted"
          /> */}
        </BentoGrid>

        {/* Quick Stats Footer */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                Acceso rápido
              </p>
              <p className="text-xs text-muted-foreground">
                Presiona cualquier card para navegar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}