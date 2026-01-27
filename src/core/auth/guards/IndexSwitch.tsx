// core/auth/ui/IndexSwitch.tsx
import { Navigate } from "react-router-dom";

import { useAuth } from "@/core/auth/context/AuthProvider";
import Home from "@/features/home/ui/Home";

export default function IndexSwitch() {
  const { authState } = useAuth();
  const { role, checkingAuth } = authState;

  if (checkingAuth) {
    return <div>Cargando...</div>;
  }

  if (role === "PROVEEDOR") {
    return <Navigate to="stock" replace />;
  }

  if (
    role === "ADMIN" ||
    role === "USER" ||
    role === "OBRA_SOCIAL" ||
    role === "ADMIN_VENTAS"
  ) {
    return <Home />;
  }

  return <Navigate to="/unauthorized" replace />;
}
