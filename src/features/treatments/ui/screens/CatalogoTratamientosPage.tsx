import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Power, Stethoscope, Sparkles, Search } from "lucide-react";

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { SPLIT_RULE_LABELS, useCreateProcedureMutation, useGetProcedureCatalogQuery, useSetProcedureActiveMutation, useUpdateProcedureMutation, type ProcedureCatalogItem, type ProcedureCatalogPayload, type ProcedureSplitRule } from "./api/procedureCatalogApi";


type Draft = {
  id: string | null;
  code: string;
  label: string;
  splitRule: ProcedureSplitRule;
  amount: string; // texto en el input; "" = a convenir
};

const EMPTY_DRAFT: Draft = {
  id: null,
  code: "",
  label: "",
  splitRule: "MEDICA_100",
  amount: "",
};

export default function CatalogoTratamientosPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data, isLoading, isFetching } = useGetProcedureCatalogQuery({ includeInactive });
  const [createProcedure, createState] = useCreateProcedureMutation();
  const [updateProcedure, updateState] = useUpdateProcedureMutation();
  const [setActive] = useSetProcedureActiveMutation();

  const saving = createState.isLoading || updateState.isLoading;

  const { medica, cosmetologia } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = (data ?? []).filter(
      (r) =>
        !q ||
        r.label.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
    );
    return {
      medica: rows.filter((r) => r.kind === "MEDICA"),
      cosmetologia: rows.filter((r) => r.kind === "COSMETOLOGIA"),
    };
  }, [data, search]);

  const openNew = () => setDraft({ ...EMPTY_DRAFT });
  const openEdit = (r: ProcedureCatalogItem) =>
    setDraft({
      id: r.id,
      code: r.code,
      label: r.label,
      splitRule: r.splitRule,
      amount: r.amount == null ? "" : String(r.amount),
    });

  const save = async () => {
    if (!draft) return;
    if (!draft.code.trim() || !draft.label.trim()) {
      toast.error("Código y nombre son obligatorios");
      return;
    }
    const amountNum = draft.amount.trim() === "" ? null : Number(draft.amount);
    if (amountNum != null && (Number.isNaN(amountNum) || amountNum < 0)) {
      toast.error("El precio no es válido");
      return;
    }
    const body: ProcedureCatalogPayload = {
      code: draft.code.trim().toUpperCase().replace(/\s+/g, "_"),
      label: draft.label.trim(),
      splitRule: draft.splitRule,
      amount: amountNum,
    };
    try {
      if (draft.id) {
        await updateProcedure({ id: draft.id, body }).unwrap();
        toast.success("Tratamiento actualizado");
      } else {
        await createProcedure(body).unwrap();
        toast.success("Tratamiento creado");
      }
      setDraft(null);
    } catch (e: any) {
      toast.error(e?.data?.message || "No se pudo guardar");
    }
  };

  const toggleActive = async (r: ProcedureCatalogItem) => {
    try {
      await setActive({ id: r.id, active: !r.active }).unwrap();
      toast.success(r.active ? "Tratamiento dado de baja" : "Tratamiento reactivado");
    } catch (e: any) {
      toast.error(e?.data?.message || "No se pudo cambiar el estado");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catálogo de tratamientos</h1>
          <p className="text-sm text-muted-foreground">
            Alta y edición de tratamientos. El reparto que elijas acá es el que
            usa la caja: no hace falta tocar código.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 size-4" />
          Nuevo tratamiento
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="pl-8"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={includeInactive} onCheckedChange={setIncludeInactive} />
          Mostrar dados de baja
        </label>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CatalogGroup
            title="Dermatológicos"
            icon={<Stethoscope className="size-4 text-sky-600" />}
            rows={medica}
            onEdit={openEdit}
            onToggle={toggleActive}
            busy={isFetching}
          />
          <CatalogGroup
            title="Cosmetológicos"
            icon={<Sparkles className="size-4 text-violet-600" />}
            rows={cosmetologia}
            onEdit={openEdit}
            onToggle={toggleActive}
            busy={isFetching}
          />
        </div>
      )}

      <EditDialog
        draft={draft}
        onChange={setDraft}
        onClose={() => setDraft(null)}
        onSave={save}
        saving={saving}
      />
    </div>
  );
}

function CatalogGroup({
  title, icon, rows, onEdit, onToggle, busy,
}: {
  title: string;
  icon: React.ReactNode;
  rows: ProcedureCatalogItem[];
  onEdit: (r: ProcedureCatalogItem) => void;
  onToggle: (r: ProcedureCatalogItem) => void;
  busy: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <Badge variant="secondary" className="ml-auto">{rows.length}</Badge>
        </CardTitle>
        <CardDescription>Tocá un tratamiento para editarlo.</CardDescription>
      </CardHeader>
      <CardContent className={"space-y-1 " + (busy ? "opacity-60" : "")}>
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin tratamientos.
          </p>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className={
              "flex items-center gap-2 rounded-lg border p-2.5 text-sm " +
              (r.active ? "" : "opacity-50")
            }
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{r.label}</span>
                {!r.active && <Badge variant="outline">baja</Badge>}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span className="font-mono">{r.code}</span>
                <span>·</span>
                <span>
                  {r.kind === "MEDICA"
                    ? "100% médica"
                    : `${Math.round(r.cosmetologistPercent * 100)}% Gise / ${Math.round(
                        r.doctorPercent * 100
                      )}% médica`}
                </span>
                <span>·</span>
                <span>{r.amount && r.amount > 0 ? currencyFormatter.format(r.amount) : "a convenir"}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(r)} aria-label="Editar">
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(r)}
              aria-label={r.active ? "Dar de baja" : "Reactivar"}
            >
              <Power className={"size-4 " + (r.active ? "text-destructive" : "text-emerald-600")} />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EditDialog({
  draft, onChange, onClose, onSave, saving,
}: {
  draft: Draft | null;
  onChange: (d: Draft) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const open = draft !== null;
  const isEdit = Boolean(draft?.id);

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar tratamiento" : "Nuevo tratamiento"}</DialogTitle>
          <DialogDescription>
            El reparto define cómo se divide la plata en la caja.
          </DialogDescription>
        </DialogHeader>

        {draft && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="label">Nombre</Label>
              <Input
                id="label"
                value={draft.label}
                onChange={(e) => onChange({ ...draft, label: e.target.value })}
                placeholder="LIMPIEZA PREMIUM"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={draft.code}
                onChange={(e) => onChange({ ...draft, code: e.target.value })}
                placeholder="LIMPIEZA_PREMIUM"
                className="font-mono"
                disabled={isEdit}
              />
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? "El código no se cambia: es la clave del histórico."
                  : "Se guarda en mayúsculas. Es la clave de las métricas."}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Reparto</Label>
              <Select
                value={draft.splitRule}
                onValueChange={(v) => onChange({ ...draft, splitRule: v as ProcedureSplitRule })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SPLIT_RULE_LABELS) as ProcedureSplitRule[]).map((rule) => (
                    <SelectItem key={rule} value={rule}>
                      {SPLIT_RULE_LABELS[rule]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Precio de lista</Label>
              <Input
                id="amount"
                inputMode="numeric"
                value={draft.amount}
                onChange={(e) => onChange({ ...draft, amount: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="Dejar vacío = a convenir"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}