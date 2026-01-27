import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { Loader2 } from "lucide-react"; // shadcn loader
import { useAuth } from "@/core/auth/context/AuthProvider";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { authState, loading } = useAuth();


  const isChecking = loading || authState.checkingAuth;

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
