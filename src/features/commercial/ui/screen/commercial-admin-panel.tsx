import { Banner } from "@/shared/components/ui/banner";
import { CTACard } from "@/shared/components/ui/charts/cta-card";
import { Store, Truck, Users } from "lucide-react";

const CommercialAdminPanel = () => {
  return (
    <div>
      <Banner
        title="Panel de Administración Comercial"
        description="Gestión y configuración de comerciales"
      />


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        <CTACard
          title="Equipo A"
          description="Accede a la informacion de comerciales Equipo A"
          href="/inicio/commercial/a"
          icon={<Users className="h-6 w-6" />}
        />
        <CTACard
          title="Equipo B"
          description="Accede a la informacion de comerciales Equipo B"
          href="/inicio/commercial/b"
          icon={<Truck className="h-6 w-6" />}
        />
        <CTACard
          title="Equipo C"
          description="Accede a la informacion de comerciales Equipo C"
          href="/inicio/commercial/c"
          icon={<Store className="h-6 w-6" />}
        />
      </div>
    </div>
  );
};

export default CommercialAdminPanel;
