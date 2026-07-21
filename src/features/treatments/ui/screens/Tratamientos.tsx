import { useState, useMemo } from "react";
import { Plus, Syringe } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { TreatmentsTable } from "./components/TreatmentsTable";
import { AddPaymentDialog } from "./components/AddPaymentDialog";
import { DermatoProcedureDialog } from "./components/DermatoProcedureDialog";
import { useTreatmentsPage } from "./hooks/useTreatmentsPage";
import type { Treatment } from "./models/treatment";
import { RegisterTreatmentDialog } from "./components/RegisterTratmentDialog";

export default function Tratamientos() {
  const {
    canRegister,
    treatments,
    isLoading,
    isCreating,
    isPaying,
    registerTreatment,
    addPayment,
  } = useTreatmentsPage();
  const [search, setSearch] = useState("");

  const filteredTreatments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return treatments;
    return treatments.filter((t) => t.patientName.toLowerCase().includes(q));
  }, [treatments, search]);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Treatment | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tratamientos</h1>
          <p className="text-sm text-muted-foreground">
            Peeling profundo con paciente y cuotas, y sesiones con consumo de
            insumos por uso.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Sesiones: cobran y descuentan insumos (ml/ampollas/disparos).
              Sin gate de rol: las de Gise las registra ella. */}
          <Button variant="outline" className="gap-2" onClick={() => setIsSessionOpen(true)}>
            <Syringe className="size-4" />
            Registrar sesión
          </Button>

          {canRegister && (
            <Button className="gap-2" onClick={() => setIsRegisterOpen(true)}>
              <Plus className="size-4" />
              Registrar peeling
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>Tratamientos registrados y su saldo pendiente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre de paciente..."
              className="max-w-sm"
            />
          </div>
          <TreatmentsTable
            treatments={filteredTreatments}
            isLoading={isLoading}
            canRegister={canRegister}
            onAddPayment={setPayTarget}
          />
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

      <DermatoProcedureDialog open={isSessionOpen} onOpenChange={setIsSessionOpen} />

      <AddPaymentDialog
        open={!!payTarget}
        onOpenChange={(o) => !o && setPayTarget(null)}
        treatment={payTarget}
        isPaying={isPaying}
        onPay={addPayment}
      />
    </div>
  );
}