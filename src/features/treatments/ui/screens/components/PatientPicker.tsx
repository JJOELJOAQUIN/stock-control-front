// features/treatments/ui/components/PatientPicker.tsx
import { useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Check } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import type { Patient } from "../models/treatment";
import { useCreatePatientMutation, useSearchPatientsQuery } from "../api/patientsApi";


type Props = {
  selected: Patient | null;
  onSelect: (patient: Patient | null) => void;
};

export function PatientPicker({ selected, onSelect }: Props) {
  const [term, setTerm] = useState("");
  const [creating, setCreating] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: results = [] } = useSearchPatientsQuery(
    { term },
    { skip: creating || !!selected }
  );
  const [createPatient, { isLoading: isCreatingPatient }] =
    useCreatePatientMutation();

  // Paciente ya elegido.
  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
        <div>
          <p className="font-medium">
            {selected.firstName} {selected.lastName}
          </p>
          {selected.phone && (
            <p className="text-xs text-muted-foreground">{selected.phone}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Cambiar
        </Button>
      </div>
    );
  }

  // Alta rápida de paciente.
  if (creating) {
    const handleCreate = async () => {
      if (!firstName.trim() || !lastName.trim()) {
        toast.error("Nombre y apellido son obligatorios");
        return;
      }
      try {
        const patient = await createPatient({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
        }).unwrap();
        onSelect(patient);
      } catch (error: any) {
        toast.error(error?.data?.message || "No se pudo crear el paciente");
      }
    };

    return (
      <div className="space-y-3 rounded-lg border p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Apellido</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Teléfono (opcional)</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            disabled={isCreatingPatient}
            className="gap-2"
          >
            <Check className="size-4" />
            Guardar paciente
          </Button>
          <Button variant="ghost" onClick={() => setCreating(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // Búsqueda.
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar paciente por nombre..."
          className="pl-9"
        />
      </div>

      {results.length > 0 && (
        <ul className="max-h-48 overflow-y-auto rounded-md border">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="flex w-full items-center justify-between border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50"
              >
                <span className="text-sm font-medium">
                  {p.firstName} {p.lastName}
                </span>
                {p.phone && (
                  <span className="text-xs text-muted-foreground">
                    {p.phone}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="outline"
        onClick={() => setCreating(true)}
        className="w-full gap-2"
      >
        <UserPlus className="size-4" />
        Crear paciente nuevo
      </Button>
    </div>
  );
}