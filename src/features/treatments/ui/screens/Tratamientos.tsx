// features/treatments/ui/screens/Tratamientos.tsx
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useTreatmentsPage } from "./hooks/useTreatmentsPage";
import { TreatmentsTable } from "./components/TreatmentsTable";
import { RegisterTreatmentDialog } from "./components/RegisterTratmentDialog";


export default function Tratamientos() {
  const { canRegister, treatments, isLoading, isCreating, registerTreatment } =
    useTreatmentsPage();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tratamientos</h1>
          <p className="text-sm text-muted-foreground">
            Procedimientos con paciente y pagos (peeling profundo).
          </p>
        </div>

        {canRegister && (
          <Button className="gap-2" onClick={() => setIsRegisterOpen(true)}>
            <Plus className="size-4" />
            Registrar peeling
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>
            Tratamientos registrados y su saldo pendiente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TreatmentsTable treatments={treatments} isLoading={isLoading} />
        </CardContent>
      </Card>

      {canRegister && (
        <RegisterTreatmentDialog
          open={isRegisterOpen}
          onOpenChange={setIsRegisterOpen}
          onSubmit={registerTreatment}
          isSubmitting={isCreating}
        />
      )}
    </div>
  );
}