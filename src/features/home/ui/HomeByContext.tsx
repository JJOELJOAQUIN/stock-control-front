import { useBusinessContext } from "@/core/context/business-context";
import HomeLocal from "./screens/HomeLocal";
import HomeConsultorio from "./screens/HomeConsultorio";

export default function HomeByContext() {
  const { context } = useBusinessContext();
  const resolvedContext = context ?? "LOCAL";

  return resolvedContext === "LOCAL" ? <HomeLocal /> : <HomeConsultorio />;
}