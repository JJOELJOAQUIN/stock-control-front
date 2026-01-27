// core/auth/guards/RoleGuard.tsx
import { Navigate, Outlet } from "react-router-dom";
import { type JSX } from "react";
import { useAuth } from "@/core/auth/context/AuthProvider";

interface Props {
  allowedRoles: string[];
  redirectPath?: string;
  indexElement?: JSX.Element;
}

export default function RoleGuard({
  allowedRoles,
  redirectPath = "/forbidden",
  indexElement,
}: Props) {
  const { authState } = useAuth();
  const { isAuthenticated, roles, checkingAuth } = authState;

  if (checkingAuth) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = roles.some((r) => allowedRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to={redirectPath} replace />;
  }

  if (indexElement) return indexElement;

  return <Outlet />;
}
