import { useBusinessContext } from "@/core/context/business-context";

import HomeConsultorio from "./screens/HomeConsultorio";

export default function HomeByContext() {
  const { context } = useBusinessContext();
  const resolvedContext = context ?? "CONSULTORIO";

  return resolvedContext === "CONSULTORIO" ? <HomeConsultorio /> : null;
}