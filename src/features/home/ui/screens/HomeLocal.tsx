// import { useState } from "react";
// import { BentoGrid } from "@/shared/components/bento-grid";
// import { BentoNavCard, BentoStatCard, BentoSectionCard } from "@/shared/components/bento-card";
// import { Input } from "@/shared/components/ui/input";
// import { Package, Wallet, Receipt, Search, TrendingUp, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

// export default function HomeLocal() {
//   const [searchQuery, setSearchQuery] = useState("");

//   return (
//     <div className="min-h-full bg-background text-foreground space-y-6">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Panel Local</h1>
//           <p className="text-muted-foreground">Gestión del local.</p>
//         </div>

//         <div className="relative w-full sm:w-80">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             placeholder="Buscar productos, movimientos..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//       </div>

//       <BentoGrid>
//         <BentoSectionCard
//           href="/inicio/stock"
//           className="col-span-1 row-span-2 sm:col-span-2 lg:col-span-2"
//           icon={<Package className="h-6 w-6" />}
//           title="Stock"
//           description="Inventario del local"
//           items={["Ingresar", "Egresar", "Ver inventario"]}
//         />

//         <BentoNavCard
//           href="/inicio/caja/local"
//           variant="neutral"
//           icon={<Wallet className="h-6 w-6" />}
//           title="Caja Local"
//           description="Flujo de dinero del local"
//         />

//         {/* Stats */}
//         <BentoStatCard
//           href="/inicio/stock"
//           label="Total Productos"
//           value="156"
//           change="+12 esta semana"
//           changePositive
//           icon={<Package className="h-4 w-4" />}
//         />

//         <BentoStatCard
//           href="/inicio/caja/local"
//           label="Caja Local"
//           value="$45,230"
//           change="+8.2% vs mes anterior"
//           changePositive
//           icon={<TrendingUp className="h-4 w-4" />}
//         />

//         <BentoNavCard
//           href="/inicio/stock?action=ingresar"
//           variant="teal"
//           icon={<ArrowDownToLine className="h-6 w-6" />}
//           title="Ingresar Stock"
//           description="Agregar productos al inventario"
//         />

//         <BentoNavCard
//           href="/inicio/stock?action=egresar"
//           variant="rose"
//           icon={<ArrowUpFromLine className="h-6 w-6" />}
//           title="Egresar Stock"
//           description="Registrar salida de productos"
//         />
//       </BentoGrid>
//     </div>
//   );
// }