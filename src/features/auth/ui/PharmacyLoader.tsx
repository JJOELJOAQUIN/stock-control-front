import { Loader2 } from "lucide-react";


export default function PharmacyLoader() {


  return (
    <div className="flex h-[200px] flex-col items-center justify-center">
      {/* Ícono girando */}
      <Loader2 className="h-[60px] w-[60px] text-primary animate-spin" />

      {/* Texto */}
      <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>

      {/* Logo */}
      <img
        width={300}
        height={300}
        className="mt-6"
        src="/audifarm_logo.png"
        alt="Logo"
      />
    </div>
  );
}
