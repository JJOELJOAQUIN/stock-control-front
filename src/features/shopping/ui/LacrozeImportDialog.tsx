import { useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  X,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/lib/utils";
import { currencyFormatter } from "@/shared/lib/purchase";

import type {
  PaymentMethod,
  ProductWithStock,
} from "@/features/stock/types/stock.types";
import {
  useGetProductsWithStockQuery,
  useCreateProductMutation,
  usePurchaseProductMutation,
} from "@/features/stock/api/stockApi";
import {
  parseLacrozeLines,
  extractLinesFromPdf,
  type LacrozeParseResult,
} from "@/lib/parseLacrozePdf";
import {
  extractLinesFromImage,
  isImageFile,
  isPdfFile,
} from "@/lib/lacrozeOcr";
import { allResolved, matchLacrozeLines, type MatchedLine } from "@/lib/matchLacrozeProducts";




type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CASH", label: "Efectivo" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

export function LacrozeImportDialog({ open, onOpenChange }: Props) {
  const { data: products = [] } = useGetProductsWithStockQuery({
    context: "CONSULTORIO",
  });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [purchaseProduct, { isLoading: isSubmitting }] =
    usePurchaseProductMutation();

  const [parsing, setParsing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<LacrozeParseResult | null>(null);
  const [lines, setLines] = useState<MatchedLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [comment, setComment] = useState("");
  const [updateCost, setUpdateCost] = useState(true);
  const [createFor, setCreateFor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const productById = useMemo(() => {
    const m = new Map<string, ProductWithStock>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const ready = allResolved(lines);
  const total = useMemo(
    () => lines.reduce((acc, l) => acc + l.cantidad * l.precioUnit, 0),
    [lines]
  );

  function resetAll() {
    setParseResult(null);
    setLines([]);
    setComment("");
    setPaymentMethod("TRANSFER");
    setUpdateCost(true);
    setCreateFor(null);
    setParsing(false);
    setOcrProgress(null);
  }

  function handleClose(next: boolean) {
    if (!next) resetAll();
    onOpenChange(next);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const pdf = isPdfFile(file);
    const img = isImageFile(file);
    if (!pdf && !img) {
      toast.error("Subí un PDF o una foto (JPG/PNG) del pedido de Lacroze.");
      return;
    }

    setParsing(true);
    setOcrProgress(img ? 0 : null);
    try {
      // Extracción de texto: PDF por capa de texto, imagen por OCR.
      const textLines = img
        ? await extractLinesFromImage(file, (pr) => setOcrProgress(pr))
        : await extractLinesFromPdf(file);
        console.log("OCR LÍNEAS:", textLines);

      const result = parseLacrozeLines(textLines);
      if (result.lines.length === 0) {
        toast.error(
          img
            ? "No se detectó ningún producto en la foto. Probá con una imagen más nítida o cargá el PDF."
            : "No se detectó ningún producto en el PDF. ¿Es el documento de Lacroze?"
        );
        return;
      }
      const matched = matchLacrozeLines(result.lines, products);
      setParseResult(result);
      setLines(matched);
      setComment(
        result.meta.factura
          ? `LACROZE ${result.meta.factura}${result.meta.fecha ? " · " + result.meta.fecha : ""}`
          : "Compra LACROZE"
      );
      if (img) {
        toast.info(
          "Leído por OCR: revisá bien cantidades y costos antes de confirmar."
        );
      }
      for (const w of result.warnings) toast.warning(w);
    } catch {
      toast.error("No se pudo leer el archivo. Probá de nuevo o revisá que sea legible.");
    } finally {
      setParsing(false);
      setOcrProgress(null);
    }
  }

  // Edita cantidad/costo de una línea (red de seguridad del OCR).
  function patchLine(index: number, patch: { cantidad?: number; precioUnit?: number }) {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  }

  function assign(index: number, productId: string) {
    setLines((prev) =>
      prev.map((l, i) =>
        i === index ? { ...l, productId, status: "matched" } : l
      )
    );
  }

  async function handleCreate(index: number, req: NewProductForm) {
    try {
      const created = await createProduct({
        name: req.name.trim(),
        category: req.category.trim(),
        brand: req.brand.trim(),
        scope: "CONSULTORIO",
        minimumStock: req.minimumStock,
        costPrice: req.costPrice,
        expirable: true,
      }).unwrap();
      assign(index, created.id);
      setCreateFor(null);
      toast.success(`Producto "${created.name}" creado y asignado.`);
    } catch {
      toast.error("No se pudo crear el producto.");
    }
  }

  async function handleConfirm() {
    if (!parseResult || !ready) return;
    try {
      await purchaseProduct({
        context: "CONSULTORIO",
        comment: comment.trim() || undefined,
        paymentMethod,
        expectedTotal: total,
        items: lines.map((l) => ({
          productId: l.productId as string,
          quantity: l.cantidad,
          unitCost: l.precioUnit,
          lotNumber: null,
          expirationDate: null,
          updateCostPrice: updateCost,
          updateSalePrice: false,
          newSalePrice: null,
          updateMarkupPercentage: false,
          newDefaultMarkupPercentage: null,
        })),
      }).unwrap();
      toast.success("Compra de LACROZE registrada.");
      handleClose(false);
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "data" in e
          ? (e as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(msg || "No se pudo registrar la compra.");
    }
  }

  const pendingCount = lines.filter((l) => l.productId == null).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-[92dvh] max-h-[92dvh] flex-col sm:max-w-3xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Importar compra de LACROZE (PDF o foto)
          </DialogTitle>
          <DialogDescription>
            Arrastrá el PDF o una foto (JPG) del pedido de Farmacia Magistral
            Lacroze. Se leen los productos, se cruzan con tu catálogo y
            confirmás antes de impactar stock y caja.
          </DialogDescription>
        </DialogHeader>

        {/* -------- Paso 1: dropzone -------- */}
        {!parseResult ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "flex h-64 w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground",
                parsing && "pointer-events-none opacity-60"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf,image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {parsing ? (
                <>
                  <Spinner />
                  <p className="text-sm text-muted-foreground">
                    {ocrProgress != null
                      ? `Leyendo la foto (OCR)… ${Math.round(ocrProgress * 100)}%`
                      : "Leyendo el PDF…"}
                  </p>
                  {ocrProgress != null && (
                    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.round(ocrProgress * 100)}%` }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex gap-2 text-muted-foreground">
                    <Upload className={cn("size-12", dragActive && "text-primary")} />
                    <ImageIcon className={cn("size-12", dragActive && "text-primary")} />
                  </div>
                  <p className="text-base text-muted-foreground">
                    {dragActive
                      ? "Soltá el PDF o la foto acá…"
                      : "Arrastrá el PDF o la foto (JPG), o hacé clic para elegir"}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          /* -------- Paso 2: preview -------- */
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
            {/* Meta + controles */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field>
                <FieldLabel>Método de pago</FieldLabel>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>
                        {pm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Comentario</FieldLabel>
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Field>
            </div>

            {pendingCount > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-amber-100/70 p-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                <AlertTriangle className="size-4 shrink-0" />
                Faltan asignar {pendingCount}{" "}
                {pendingCount === 1 ? "producto" : "productos"} antes de confirmar.
              </div>
            )}

            {/* Líneas */}
            <div className="space-y-2">
              {lines.map((line, index) => {
                const matched =
                  line.productId != null ? productById.get(line.productId) : null;
                const suggestion =
                  line.suggestionId != null
                    ? productById.get(line.suggestionId)
                    : null;
                const resolved = line.productId != null;

                return (
                  <div
                    key={`${line.codigo}-${index}`}
                    className={cn(
                      "rounded-lg border p-3",
                      !resolved &&
                        "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-900/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {line.descripcion}
                        </p>
                        {/* Cantidad y costo editables: red de seguridad del OCR. */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <label className="flex items-center gap-1 text-muted-foreground">
                            Cant.
                            <Input
                              type="number"
                              min={1}
                              value={line.cantidad}
                              onChange={(e) =>
                                patchLine(index, {
                                  cantidad: Math.max(1, Math.trunc(Number(e.target.value) || 1)),
                                })
                              }
                              className="h-7 w-16"
                            />
                          </label>
                          <label className="flex items-center gap-1 text-muted-foreground">
                            Costo u.
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={line.precioUnit}
                              onChange={(e) =>
                                patchLine(index, {
                                  precioUnit: Math.max(0, Number(e.target.value) || 0),
                                })
                              }
                              className="h-7 w-24"
                            />
                          </label>
                          <span className="font-medium text-foreground">
                            = {currencyFormatter.format(line.cantidad * line.precioUnit)}
                          </span>
                          {line.importeDescuadra && (
                            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                              <AlertTriangle className="size-3" />
                              revisar (¿OCR?)
                            </span>
                          )}
                        </div>
                      </div>
                      {resolved ? (
                        <Badge className="shrink-0 gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircle2 className="size-3.5" />
                          {matched?.name ?? "Asignado"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <AlertTriangle className="size-3.5" />
                          Sin asignar
                        </Badge>
                      )}
                    </div>

                    {!resolved && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {suggestion && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assign(index, suggestion.id)}
                          >
                            <CheckCircle2 className="size-4" />
                            Es “{suggestion.name}”
                          </Button>
                        )}
                        <ProductPicker
                          products={products}
                          onPick={(id) => assign(index, id)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCreateFor(index)}
                        >
                          <Plus className="size-4" />
                          Crear producto
                        </Button>
                      </div>
                    )}

                    {resolved && (
                      <button
                        type="button"
                        onClick={() =>
                          setLines((prev) =>
                            prev.map((l, i) =>
                              i === index
                                ? { ...l, productId: null, status: "unmatched" }
                                : l
                            )
                          )
                        }
                        className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" />
                        Cambiar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <label
              htmlFor="lacroze-update-cost"
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"
            >
              <Checkbox
                id="lacroze-update-cost"
                checked={updateCost}
                onCheckedChange={(c) => setUpdateCost(c === true)}
              />
              Actualizar el costo de todos los productos con esta compra
            </label>
          </div>
        )}

        {/* Total + footer (solo en preview) */}
        {parseResult && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              Total de la compra ({lines.length} ítems)
            </span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {currencyFormatter.format(total)}
            </span>
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          {parseResult && (
            <Button variant="ghost" onClick={resetAll}>
              Cargar otro archivo
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={!ready || isSubmitting || !parseResult}
          >
            {isSubmitting && <Spinner />}
            Confirmar compra
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Crear producto para una línea sin match */}
      {createFor != null && lines[createFor] && (
        <CreateProductDialog
          open={createFor != null}
          onOpenChange={(o) => !o && setCreateFor(null)}
          defaultName={lines[createFor].descripcion}
          defaultCost={lines[createFor].precioUnit}
          isCreating={isCreating}
          onCreate={(form) => handleCreate(createFor, form)}
        />
      )}
    </Dialog>
  );
}

/* ============================ Product picker ============================ */

function ProductPicker({
  products,
  onPick,
}: {
  products: ProductWithStock[];
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => p.active);
    if (!q) return list.slice(0, 30);
    return list.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 30);
  }, [products, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Search className="size-4" />
          Elegir del catálogo
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 bg-white p-0 text-zinc-900 shadow-md dark:bg-[#1f1a1d] dark:text-white"
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-72 overflow-auto py-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onPick(p.id);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60 dark:hover:bg-white/5"
            >
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-xs text-muted-foreground">
                Stock: {p.currentStock}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Sin resultados
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ========================= Create product dialog ========================= */

type NewProductForm = {
  name: string;
  category: string;
  brand: string;
  minimumStock: number;
  costPrice: number;
};

function CreateProductDialog({
  open,
  onOpenChange,
  defaultName,
  defaultCost,
  isCreating,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultName: string;
  defaultCost: number;
  isCreating: boolean;
  onCreate: (form: NewProductForm) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [category, setCategory] = useState("COSMETICA");
  const [brand, setBrand] = useState("Farmacia Magistral Lacroze");
  const [minimumStock, setMinimumStock] = useState(0);
  const [costPrice, setCostPrice] = useState(defaultCost);

  const valid =
    name.trim().length > 0 &&
    category.trim().length > 0 &&
    brand.trim().length > 0 &&
    costPrice >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear producto</DialogTitle>
          <DialogDescription>
            Se crea en el catálogo (contexto Consultorio) y se asigna a esta
            línea de la compra.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Field>
            <FieldLabel>Nombre</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel>Categoría</FieldLabel>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Marca</FieldLabel>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Stock mínimo</FieldLabel>
              <Input
                type="number"
                min={0}
                value={minimumStock}
                onChange={(e) =>
                  setMinimumStock(Math.max(0, Math.trunc(Number(e.target.value) || 0)))
                }
              />
            </Field>
            <Field>
              <FieldLabel>Costo (por envase)</FieldLabel>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!valid || isCreating}
            onClick={() =>
              onCreate({ name, category, brand, minimumStock, costPrice })
            }
          >
            {isCreating && <Spinner />}
            Crear y asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}