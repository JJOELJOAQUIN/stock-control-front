import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { ToxinaTable } from "./components/ToxinaTable";
import { OpenVialsCard } from "./components/OpenVialsCard";
import { RegisterToxinaDialog } from "./components/RegisterToxinaDialog";
import { SecondSessionDialog } from "./components/SecondSessionDialog";
import { useToxinaPage } from "./hooks/useToxinaPage";
import type { ToxinaTreatment } from "./models/toxina";

export default function ToxinaPage() {
  const {
    canRegister,
    treatments,
    openVials,
    isLoading,
    isCreating,
    isRegisteringSession,
    registerTreatment,
    registerSecondSession,
  } = useToxinaPage();

  const [search, setSearch] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [secondTarget, setSecondTarget] = useState<ToxinaTreatment | null>(null);

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
          <Button className="gap-2" onClick={() => setIsRegisterOpen(true)}>
            <Plus className="size-4" />
            Registrar toxina
          </Button>
        )}
      </div>

      <OpenVialsCard vials={openVials} />

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>Tratamientos de toxina y unidades por sesión.</CardDescription>
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
          <ToxinaTable
            treatments={filtered}
            isLoading={isLoading}
            canRegister={canRegister}
            onSecondSession={setSecondTarget}
          />
        </CardContent>
      </Card>

      {canRegister && (
        <>
          <RegisterToxinaDialog
            open={isRegisterOpen}
            onOpenChange={setIsRegisterOpen}
            onSubmit={registerTreatment}
            isSubmitting={isCreating || isRegisteringSession}
          />
          <SecondSessionDialog
            open={!!secondTarget}
            onOpenChange={(o) => !o && setSecondTarget(null)}
            treatment={secondTarget}
            onSubmit={registerSecondSession}
            isSubmitting={isRegisteringSession}
          />
        </>
      )}
    </div>
  );
}