// RoleGuard.tsx
import { Navigate, Outlet } from "react-router-dom";

import { type JSX } from "react";
import { useAuth } from "@/core/auth/context/AuthProvider";

interface Props {
  allowedRoles: string[];
  redirectPath?: string;
  indexElement?: JSX.Element; // opcional
}

export default function RoleGuard({
  allowedRoles,
  redirectPath = "/forbidden",
  indexElement,
}: Props) {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) return <Navigate to="/forbidden" replace />;
  if (!authState.role || !allowedRoles.includes(authState.role))
    return <Navigate to={redirectPath} replace />;

  // si es index y me pasaron un componente, lo devuelvo
  if (indexElement) return indexElement;

  return <Outlet />;
}
