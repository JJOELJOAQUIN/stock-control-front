// core/auth/ui/IndexSwitch.tsx
import { Navigate } from "react-router-dom";

import { useAuth } from "@/core/auth/context/AuthProvider";
import Home from "@/features/home/ui/Home";

export default function IndexSwitch() {
  const { authState } = useAuth();
  const { roles, checkingAuth } = authState;

  if (checkingAuth) {
    return <div>Cargando...</div>;
  }

  if (roles.includes("PROVEEDOR")) {
    return <Navigate to="stock" replace />;
  }

  if (
    roles.includes("ADMIN") ||
    roles.includes("USER") ||
    roles.includes("OBRA_SOCIAL") ||
    roles.includes("ADMIN_VENTAS")
  ) {
    return <Home />;
  }

  return <Navigate to="/unauthorized" replace />;
}
