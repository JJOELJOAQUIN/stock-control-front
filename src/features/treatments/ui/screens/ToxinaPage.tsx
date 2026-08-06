import { useMemo, useState } from "react";
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

import type { Treatment } from "./models/treatment";
import { useToxinaPage } from "./hooks/useToxinaPage";
import { OpenVialsCard } from "./components/OpenVialsCard";
import { RegisterToxinaTreatmentDialog } from "./components/RegisterToxinaTreatmentDialog";
import { RegisterToxinaSessionDialog } from "./components/RegisterToxinaSessionDialog";

export default function ToxinaPage() {
  const {
    canRegister,
    treatments,
    openVials,
    isLoading,
    isCreating,
    isRegisteringSession,
    isPaying,
    registerTreatment,
    registerToxinaSession,
    addPayment,
  } = useToxinaPage();

  const [search, setSearch] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Treatment | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return treatments;
    return treatments.filter((t) => t.patientName.toLowerCase().includes(q));
  }, [treatments, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Toxina botulínica</h1>
          <p className="text-sm text-muted-foreground">
            Xeomin con paciente. El vial abierto se comparte y vence a los 20 días.
          </p>
        </div>

        {canRegister && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsSessionOpen(true)}
            >
              <Syringe className="size-4" />
              Registrar sesión
            </Button>
            <Button className="gap-2" onClick={() => setIsRegisterOpen(true)}>
              <Plus className="size-4" />
              Registrar tratamiento
            </Button>
          </div>
        )}
      </div>

      <OpenVialsCard vials={openVials} />

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>Tratamientos de toxina y su saldo pendiente.</CardDescription>
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
            treatments={filtered}
            isLoading={isLoading}
            canRegister={canRegister}
            onAddPayment={setPayTarget}
          />
        </CardContent>
      </Card>

      {canRegister && (
        <>
          <RegisterToxinaTreatmentDialog
            open={isRegisterOpen}
            onOpenChange={setIsRegisterOpen}
            onSubmit={registerTreatment}
            isSubmitting={isCreating}
          />
          <RegisterToxinaSessionDialog
            open={isSessionOpen}
            onOpenChange={setIsSessionOpen}
            treatments={treatments}
            onSubmit={registerToxinaSession}
            isSubmitting={isRegisteringSession}
          />
        </>
      )}

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