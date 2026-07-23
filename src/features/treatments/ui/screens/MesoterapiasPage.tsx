import { useState } from "react";
import { Syringe } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { DermatoProcedureDialog } from "./components/DermatoProcedureDialog";

/**
 * Mesoterapias y sesiones dermatologicas (solo medica). El dialog resuelve
 * solo el recetario: elegis el tratamiento, valida stock y descuenta los
 * insumos (ml / ampollas / disparos) al registrar.
 */
export default function MesoterapiasPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mesoterapias</h1>
        <p className="text-sm text-muted-foreground">
          Sesiones con consumo automatico de insumos por recetario.
        </p>
      </div>

      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Syringe className="size-6" />
        </span>
        <span className="text-sm font-semibold">Registrar sesion</span>
      </Button>

      <DermatoProcedureDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}