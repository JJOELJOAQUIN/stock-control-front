import { useFirebaseClaims } from "@/core/auth/hooks/useDecodedJwt";
import { Banner } from "@/shared/components/ui/banner";
import { CTACard } from "@/shared/components/ui/charts/cta-card";
import { useBusinessContext } from "@/core/context/business-context";
import { Store, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/shared/components/ui/skeleton";

const Home = () => {
    const { claims, loading } = useFirebaseClaims();
    const role = claims?.role;
    const navigate = useNavigate();
    const { setContext } = useBusinessContext();
    console.log("JWT:", claims);
    console.log("ROLE:", role);
    const canSeeLocal = role === "ADMIN" || role === "USER";
    const canSeeConsultorio = role === "ADMIN" || role === "COSMETOLOGA";

    if (loading) {
        return (
            <Skeleton/>
        );
    }


    const goToContext = (ctx: "LOCAL" | "CONSULTORIO") => {
        setContext(ctx);
        navigate("/inicio/home");
    };

    return (
        <div>
            <Banner
                title={`Bienvenido ${claims?.name ?? "Usuario"}`}
                description="Selecciona el entorno de trabajo."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {canSeeLocal &&  (
                    <CTACard
                        title="LOCAL"
                        description="Gestionar inventario y caja del local"
                        icon={<Store className="h-6 w-6" />}
                        onClick={() => goToContext("LOCAL")}
                    />
                )}

                {canSeeConsultorio && (
                    <CTACard
                        title="CONSULTORIO"
                        description="Gestionar inventario y caja del consultorio"
                        icon={<Stethoscope className="h-6 w-6" />}
                        onClick={() => goToContext("CONSULTORIO")}
                    />
                )}

            </div>
        </div>
    );
};

export default Home;