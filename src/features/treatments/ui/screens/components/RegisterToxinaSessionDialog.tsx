import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useGetProductsWithStockQuery } from "@/features/stock/api/stockApi";

import { DEFAULT_UNITS_PER_SESSION } from "../models/toxina";
import type { Treatment } from "../models/treatment";
import type { RegisterSessionInput } from "../hooks/useToxinaPage";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatments: Treatment[];
  onSubmit: (input: RegisterSessionInput) => Promise<boolean>;
  isSubmitting: boolean;
};

export function RegisterToxinaSessionDialog({
  open,
  onOpenChange,
  treatments,
  onSubmit,
  isSubmitting,
}: Props) {
  const [treatmentId, setTreatmentId] = useState("");
  const [productId, setProductId] = useState("");
  const [sessionNumber, setSessionNumber] = useState("1");
  const [units, setUnits] = useState(String(DEFAULT_UNITS_PER_SESSION));

  const { data: products = [] } = useGetProductsWithStockQuery({ context: "CONSULTORIO" });

  // Sólo los viales de toxina (Xeomin). Si mañana hay otra toxina, este filtro
  // se amplía; por ahora alcanza con el nombre.
  const toxinaProducts = useMemo(
    () => products.filter((p) => p.name.toUpperCase().includes("XEOMIN")),
    [products]
  );

  // Precarga el vial de toxina apenas llega la lista.
  useEffect(() => {
    if (!productId && toxinaProducts.length > 0) {
      setProductId(toxinaProducts[0].id);
    }
  }, [toxinaProducts, productId]);

  // Tratamientos que todavía no están saldados (no tiene sentido dar sesión a uno cerrado).
  const openTreatments = useMemo(
    () => treatments.filter((t) => t.status !== "COMPLETO"),
    [treatments]
  );

  const reset = () => {
    setTreatmentId("");
    setProductId(toxinaProducts[0]?.id ?? "");
    setSessionNumber("1");
    setUnits(String(DEFAULT_UNITS_PER_SESSION));
  };

  const handleSubmit = async () => {
    if (!treatmentId) {
      toast.error("Elegí el tratamiento");
      return;
    }
    if (!productId) {
      toast.error("No hay un vial de toxina cargado en stock");
      return;
    }
    const unitsNum = Number(units) || 0;
    if (unitsNum <= 0) {
      toast.error("Ingresá las unidades aplicadas");
      return;
    }

    const ok = await onSubmit({
      treatmentId,
      productId,
      sessionNumber: Number(sessionNumber) || 1,
      unitsUsed: unitsNum,
    });

    if (ok) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar sesión de toxina</DialogTitle>
          <DialogDescription>
            Descuenta las unidades del vial abierto (abre uno nuevo si hace falta).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tratamiento</Label>
            <Select value={treatmentId} onValueChange={setTreatmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí el paciente" />
              </SelectTrigger>
              <SelectContent>
                {openTreatments.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.patientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Sesión</Label>
              <Select value={sessionNumber} onValueChange={setSessionNumber}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1ª sesión</SelectItem>
                  <SelectItem value="2">2ª sesión</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unidades</Label>
              <Input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="25"
              />
            </div>
          </div>

          {toxinaProducts.length > 1 && (
            <div className="space-y-1.5">
              <Label>Producto</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toxinaProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Registrar sesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}