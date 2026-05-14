// import { useEffect } from "react";
// import { useAuth } from "@/core/auth/context/AuthProvider";
// import { useNavigate } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";

// const RolePending = () => {
//   const { authState, refreshSession } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       await refreshSession();
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [refreshSession]);

//   useEffect(() => {
//     if (
//       authState.roles.length > 0 &&
//       !authState.roles.includes("PENDING")
//     ) {
//       toast.success("Cuenta aprobada correctamente");
//       navigate("/inicio");
//     }
//   }, [authState.roles, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <div className="text-center space-y-6">
//         <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />

//         <h1 className="text-2xl font-bold">
//           Cuenta en revisión
//         </h1>

//         <p className="text-muted-foreground">
//           Tu cuenta fue creada correctamente.
//           <br />
//           Un administrador debe asignarte permisos.
//         </p>

//         <div className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
//           Estado: Pendiente de aprobación
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RolePending;