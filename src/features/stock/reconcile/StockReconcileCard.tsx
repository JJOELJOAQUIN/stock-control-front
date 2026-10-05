import { useMemo, useState } from "react";
import { PackageCheck, Search } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/shared/components/ui/card";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useReconcileStockMutation } from "@/features/stock/api/stockApi";
import type { BusinessContext, ProductWithStock } from "@/features/stock/types/stock.types";

const MAX_RESULTS = 8;

const UNIT_PLURAL: Record<string, string> = {
  UNIDAD: "unidades",
  ML: "ml",
  AMPOLLA: "ampollas/viales",
  DISPARO: "disparos",
};

type Props = {
  context: BusinessContext | null;
  /** Productos activos del contexto. */
  products: ProductWithStock[];
};

/**
 * Bloque "Reconciliación de stock" de la pantalla de Stock: deja corregir a
 * mano el stock de cualquier producto con el conteo físico (sin esperar a
 * que una carga falle). Usa el mismo endpoint que el diálogo automático.
 */
export function StockReconcileCard({ context, products }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <PackageCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Reconciliación de stock</p>
              <p className="text-sm text-muted-foreground">
                Ajustá el stock de un producto a lo que hay físicamente.
              </p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => setOpen(true)} disabled={!context}>
            <PackageCheck className="h-4 w-4" />
            Reconciliación de stock
          </Button>
        </CardContent>
      </Card>

      {open && context && (
        <ReconcileDialog
          context={context}
          products={products}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ReconcileDialog({
  context,
  products,
  onClose,
}: {
  context: BusinessContext;
  products: ProductWithStock[];
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [closed, setClosed] = useState("");
  const [loose, setLoose] = useState("");
  const [comment, setComment] = useState("");
  const [reconcileStock, { isLoading }] = useReconcileStockMutation();

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => `${p.name} ${p.barcode ?? ""} ${p.brand}`.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [term, products]);

  // Siempre la versión más fresca del producto (se refresca tras guardar).
  const product = products.find((p) => p.id === selectedId) ?? null;

  const unitKey = product?.consumptionUnit ?? "UNIDAD";
  const unit = UNIT_PLURAL[unitKey] ?? unitKey.toLowerCase();
  const perPackage =
    product?.unitsPerPackage != null && product.unitsPerPackage > 1
      ? product.unitsPerPackage
      : 1;
  const byPackage = perPackage > 1;

  const closedN = closed === "" ? 0 : Number(closed);
  const looseN = loose === "" ? 0 : Number(loose);
  const valid =
    Number.isInteger(closedN) && closedN >= 0 && Number.isInteger(looseN) && looseN >= 0;
  const touched = closed !== "" || loose !== "";
  const total = valid ? closedN * perPackage + looseN : NaN;

  function pick(p: ProductWithStock) {
    setSelectedId(p.id);
    setTerm("");
    setClosed("");
    setLoose("");
  }

  async function handleSave() {
    if (!product || !valid || !touched) return;
    try {
      const r = await reconcileStock({
        productId: product.id,
        context,
        countedQuantity: total,
        comment: comment.trim() || undefined,
      }).unwrap();
      toast.success(
        r.difference === 0
          ? `${product.name}: el stock ya era ${r.current} ${unit}, no hubo cambios.`
          : `${product.name}: ${r.previous} → ${r.current} ${unit}.`
      );
      // Listo para reconciliar otro producto sin cerrar el diálogo.
      setSelectedId(null);
      setClosed("");
      setLoose("");
      setComment("");
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "data" in e
          ? (e as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(msg || "No se pudo actualizar el stock.");
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="size-5 text-primary" />
            Reconciliación de stock
          </DialogTitle>
          <DialogDescription>
            Elegí el producto y cargá lo que hay físicamente. El stock queda en
            ese valor y la diferencia se registra como ajuste en Movimientos.
          </DialogDescription>
        </DialogHeader>

        {!product ? (
          <div className="space-y-2">
            <Field>
              <FieldLabel>Producto</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  autoFocus
                  placeholder="Buscar por nombre, marca o código…"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
              </InputGroup>
            </Field>
            {term.trim() && results.length === 0 && (
              <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                No se encontraron productos para “{term.trim()}”.
              </p>
            )}
            {results.length > 0 && (
              <ul className="max-h-72 overflow-y-auto rounded-md border">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => pick(p)}
                      className="flex w-full items-center justify-between gap-2 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                    >
                      <span className="min-w-0 truncate text-sm">{p.name}</span>
                      <Badge
                        variant="secondary"
                        className={
                          p.currentStock === 0
                            ? "shrink-0 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : "shrink-0"
                        }
                      >
                        {p.currentStock}{" "}
                        {UNIT_PLURAL[p.consumptionUnit ?? "UNIDAD"] ?? ""}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{product.name}</p>
                <p className="text-muted-foreground">
                  En sistema: <b>{product.currentStock}</b> {unit}
                  {byPackage && ` · envase de ${perPackage} ${unit}`}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedId(null)}
                disabled={isLoading}
              >
                Cambiar
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {byPackage && (
                <Field>
                  <FieldLabel>Envases cerrados</FieldLabel>
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
                  {byPackage ? `${unit} sueltos (abiertos)` : `Cantidad real (${unit})`}
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
                  placeholder="Ej: conteo mensual, compra no cargada…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={200}
                />
              </Field>
            </div>

            {touched && (
              <p className="text-sm text-muted-foreground">
                {!valid ? (
                  "Usá números enteros, sin decimales."
                ) : (
                  <>
                    Stock real: <b className="text-foreground">{total} {unit}</b>
                    {total !== product.currentStock &&
                      ` (${total > product.currentStock ? "+" : ""}${total - product.currentStock} respecto del sistema)`}
                  </>
                )}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cerrar
          </Button>
          {product && (
            <Button onClick={handleSave} disabled={!touched || !valid || isLoading}>
              {isLoading && <Spinner />}
              Guardar stock
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
