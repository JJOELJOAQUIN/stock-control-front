// features/auth/ui/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/core/auth/context/AuthProvider";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { authState, loading } = useAuth();
  const { isAuthenticated, checkingAuth } = authState;

  if (loading || checkingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

 if (authState.roles.includes("ADMIN")) {
    return <>{children}</>;
  }


  return <>{children}</>;
}
