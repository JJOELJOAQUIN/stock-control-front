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

const UNIT_PLURAL: Record<string, string> = {
  UNIDAD: "unidades",
  ML: "ml",
  AMPOLLA: "ampollas/viales",
  DISPARO: "disparos",
};

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
  const [closed, setClosed] = useState("");
  const [loose, setLoose] = useState("");
  const [comment, setComment] = useState("");
  const [reconcileStock, { isLoading }] = useReconcileStockMutation();

  const unit = UNIT_PLURAL[info.unit] ?? info.unit.toLowerCase();
  const perPackage = info.unitsPerPackage > 1 ? info.unitsPerPackage : 1;
  const byPackage = perPackage > 1;

  const closedN = closed === "" ? 0 : Number(closed);
  const looseN = loose === "" ? 0 : Number(loose);
  const valid =
    Number.isInteger(closedN) && closedN >= 0 && Number.isInteger(looseN) && looseN >= 0;
  const touched = closed !== "" || loose !== "";
  const total = valid ? closedN * perPackage + looseN : NaN;
  const enough = valid && total >= info.requested;

  const finish = onDone;

  async function handleSave() {
    if (!valid || !enough) return;
    try {
      const r = await reconcileStock({
        productId: info.productId,
        context: info.context,
        countedQuantity: total,
        comment: comment.trim() || undefined,
      }).unwrap();
      toast.success(
        `Stock de ${info.productName} actualizado: ${r.previous} → ${r.current} ${unit}. Continuando con la carga…`
      );
      finish(true);
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
        if (!open && !isLoading) finish(false);
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
            En sistema: <b>{info.available}</b> {unit} · Esta carga necesita:{" "}
            <b>{info.requested}</b> {unit}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {byPackage && (
            <Field>
              <FieldLabel>Envases cerrados (de {perPackage} {unit})</FieldLabel>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="0"
                value={closed}
                onChange={(e) => setClosed(e.target.value)}
                autoFocus
              />
            </Field>
          )}
          <Field className={byPackage ? undefined : "sm:col-span-2"}>
            <FieldLabel>
              {byPackage ? `${cap(unit)} sueltos (envase abierto)` : `Cantidad real (${unit})`}
            </FieldLabel>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="0"
              value={loose}
              onChange={(e) => setLoose(e.target.value)}
              autoFocus={!byPackage}
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel>Nota (opcional)</FieldLabel>
            <Input
              placeholder="Ej: compra no cargada, conteo de heladera…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={200}
            />
          </Field>
        </div>

        {touched && (
          <p
            className={
              enough
                ? "text-sm text-emerald-700 dark:text-emerald-400"
                : "text-sm text-amber-700 dark:text-amber-400"
            }
          >
            {!valid
              ? "Usá números enteros, sin decimales."
              : enough
                ? `Stock real: ${total} ${unit}. Después de esta carga quedan ${total - info.requested} ${unit}.`
                : `Con ${total} ${unit} todavía no alcanza (se necesitan ${info.requested}).`}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => finish(false)} disabled={isLoading}>
            Cancelar carga
          </Button>
          <Button onClick={handleSave} disabled={!touched || !enough || isLoading}>
            {isLoading && <Spinner />}
            Guardar stock y continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
