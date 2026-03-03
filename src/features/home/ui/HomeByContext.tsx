import { Navigate } from "react-router-dom";
import { useBusinessContext } from "@/core/context/business-context";
import HomeLocal from "./screens/HomeLocal";
import HomeConsultorio from "./screens/HomeConsultorio";

export default function HomeByContext() {
  const { context } = useBusinessContext();

  if (!context) {
    // si no eligió contexto, volvemos al selector
    return <Navigate to="/inicio" replace />;
  }

  return context === "LOCAL" ? <HomeLocal /> : <HomeConsultorio />;
}