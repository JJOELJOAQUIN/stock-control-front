import { Banner } from "@/shared/components/ui/banner";
import { CTACard } from "@/shared/components/ui/charts/cta-card";
import { useBusinessContext } from "@/core/context/business-context";
import {  Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { setContext } = useBusinessContext();

  const goToContext = (ctx: "LOCAL" | "CONSULTORIO") => {
    setContext(ctx);
    navigate("/inicio/home");
  };

  return (
    <div>
      <Banner
        title="Bienvenido"
        description="Selecciona el entorno de trabajo."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* <CTACard
          title="LOCAL"
          description="Gestionar inventario y caja del local"
          icon={<Store className="h-6 w-6" />}
          onClick={() => goToContext("LOCAL")}
        /> */}

        <CTACard
          title="CONSULTORIO"
          description="Gestionar inventario y caja del consultorio"
          icon={<Stethoscope className="h-6 w-6" />}
          onClick={() => goToContext("CONSULTORIO")}
        />
      </div>
    </div>
  );
};

export default Home;