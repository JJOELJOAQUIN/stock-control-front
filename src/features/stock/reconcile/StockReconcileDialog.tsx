import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useHasRole } from "@/features/auth/hooks/useRoles";
import { useReconcileStockMutation } from "@/features/stock/api/stockApi";
import {
  registerStockReconcileListener,
  type InsufficientStockInfo,
} from "./stockReconcileBridge";
import { ReconcileQuantityFields } from "./ReconcileQuantityFields";
import { computeTarget, qtyWithUnit, type ReconcileMode } from "./reconcileQuantity";
import { scaleOf } from "@/lib/units";

type Pending = { info: InsufficientStockInfo; resolve: (ok: boolean) => void };

/**
 * "Editar stock": aparece solo cuando una carga (tratamiento, venta, toxina)
 * falla porque el sistema cree que no hay stock. La persona carga lo que hay
 * físicamente, se reconcilia el stock y la carga original se reintenta sola.
 *
 * Se monta UNA vez en main.tsx; el disparo viene de customBaseQuery vía
 * stockReconcileBridge.
 */
export function StockReconcileDialog() {
  const canReconcile = useHasRole(["ADMIN", "COSMETOLOGA"]);
  const [queue, setQueue] = useState<Pending[]>([]);

  useEffect(
    () =>
      registerStockReconcileListener((info, resolve) => {
        // Sin permiso para /api/stock: no ofrecer nada (un 403 desloguea).
        if (!canReconcile) {
          resolve(false);
          return;
        }
        setQueue((q) => [...q, { info, resolve }]);
      }),
    [canReconcile]
  );

  const current = queue[0];
  if (!current) return null;

  // key: un formulario limpio por cada pedido de reconciliación.
  return (
    <ReconcileForm
      key={`${current.info.productId}-${queue.length}`}
      info={current.info}
      onDone={(ok) => {
        current.resolve(ok);
        setQueue((q) => q.slice(1));
      }}
    />
  );
}

function ReconcileForm({
  info,
  onDone,
}: {
  info: InsufficientStockInfo;
  onDone: (ok: boolean) => void;
}) {
  const [mode, setMode] = useState<ReconcileMode>("total");
  const [raw, setRaw] = useState("");
  const [comment, setComment] = useState("");
  const [reconcileStock, { isLoading }] = useReconcileStockMutation();

  const scale = scaleOf(info.unitScale);
  const { targetStored } = computeTarget(mode, raw, info.available, scale);
  const enough = targetStored != null && targetStored >= info.requested;

  async function handleSave() {
    if (targetStored == null || !enough) return;
    try {
      const r = await reconcileStock({
        productId: info.productId,
        context: info.context,
        countedQuantity: targetStored,
        comment: comment.trim() || undefined,
      }).unwrap();
      toast.success(
        `Stock de ${info.productName}: ${qtyWithUnit(r.previous, info.unit, scale)} → ${qtyWithUnit(r.current, info.unit, scale)}. Continuando con la carga…`
      );
      onDone(true);
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "data" in e
          ? (e as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(msg || "No se pudo actualizar el stock.");
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isLoading) onDone(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="size-5 text-primary" />
            Editar stock
          </DialogTitle>
          <DialogDescription>
            El sistema dice que no alcanza el stock para esta carga. Si en
            realidad tenés, cargá lo que hay físicamente y seguimos con la
            carga.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <p className="font-medium">{info.productName}</p>
          <p className="text-muted-foreground">
            En sistema: <b>{qtyWithUnit(info.available, info.unit, scale)}</b> · Esta
            carga necesita: <b>{qtyWithUnit(info.requested, info.unit, scale)}</b>
          </p>
        </div>

        <ReconcileQuantityFields
          mode={mode}
          onModeChange={setMode}
          raw={raw}
          onRawChange={setRaw}
          currentStored={info.available}
          unit={info.unit}
          scale={scale}
          unitsPerPackageStored={info.unitsPerPackage}
          requiredStored={info.requested}
          autoFocus
        />

        <Field>
          <FieldLabel>Nota (opcional)</FieldLabel>
          <Input
            placeholder="Ej: compra no cargada, conteo de heladera…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={200}
          />
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => onDone(false)} disabled={isLoading}>
            Cancelar carga
          </Button>
          <Button onClick={handleSave} disabled={!enough || isLoading}>
            {isLoading && <Spinner />}
            Guardar stock y continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
