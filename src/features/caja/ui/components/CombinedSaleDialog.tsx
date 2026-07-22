import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Search, Package, Sparkles, ShoppingBag } from "lucide-react";

import type { CashActor, PaymentMethod, ProcedureOption } from "../../types/cash.types";
import type { SaleDraftLine } from "./ProductSaleDialog";
import { usePerformer } from "@/features/caja/hooks/usePerformer";
import { Badge } from "@/shared/components/ui/badge";
import type { ProductWithStock } from "@/features/stock/types/stock.types";
import type {
    CombinedSaleItemRequest,
    CombinedSaleRequest,
} from "../../types/combined-sale.types";
import { useCombinedSaleMutation } from "@/features/stock/api/stockApi";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { PAYMENT_METHODS, PEELING_PROTOCOLO_CODE } from "@/lib/peeling";

type Context = "LOCAL" | "CONSULTORIO";

const CASH_PRODUCT_DISCOUNT = 0.10;

// Línea del carrito (unión discriminada por kind).
type CartLine =
    | {
        uid: string;
        kind: "PRODUCT";
        productId: string;
        description: string;
        quantity: number;
        unitAmount: number;
        performedBy: CashActor | null;
    }
    | {
        uid: string;
        kind: "PROCEDURE";
        procedureCode: string;
        description: string;
        quantity: number;
        unitAmount: number;
        doctorSharePercent: number;
        cosmetologistSharePercent: number;
    };

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    context: Context;
    products: ProductWithStock[];
    procedures: ProcedureOption[];
    /** Split por defecto para procedimientos (los mismos que pasás a ProcedureIncomeCard). */
    defaultDoctorSharePercent: number;
    defaultCosmetologistSharePercent: number;
    /**
     * Líneas con las que arranca el carrito al abrir. Es el puente desde la
     * venta unitaria: el usuario empezó una venta simple y necesitó sumar más
     * productos, así que lo cargado se traspasa acá en vez de perderse.
     *
     * Los precios vienen de LISTA, sin descuento aplicado: el descuento por
     * efectivo lo calcula este diálogo, y si llegaran ya descontados se
     * aplicaría dos veces.
     */
    seedLines?: SaleDraftLine[];
    onSuccess?: () => void;
};

let uidSeq = 0;
const nextUid = () => `line-${uidSeq++}`;

// Redondeo a 2 decimales.
const round2 = (n: number) => Math.round(n * 100) / 100;

export function CombinedSaleDialog({
    open,
    onOpenChange,
    context,
    products,
    procedures,
    defaultDoctorSharePercent,
    defaultCosmetologistSharePercent,
    seedLines,
    onSuccess,
}: Props) {
    // Quien realiza la venta sale del usuario logueado.
    const performer = usePerformer();

    const [lines, setLines] = useState<CartLine[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [comment, setComment] = useState("");
    const [attempted, setAttempted] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [query, setQuery] = useState("");

    const [combinedSale, { isLoading: isSubmitting }] = useCombinedSaleMutation();

    const lineRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const isConsultorio = context === "CONSULTORIO";
    const isCard = paymentMethod === "CREDIT" || paymentMethod === "DEBIT";
    const isCashDiscount = paymentMethod === "CASH";

    // Precio unitario efectivo (con descuento si es producto + efectivo).
    const effectiveUnit = (l: CartLine) =>
        isCashDiscount && l.kind === "PRODUCT"
            ? round2(l.unitAmount * (1 - CASH_PRODUCT_DISCOUNT))
            : l.unitAmount;

    // Subtotal de una línea, con descuento aplicado si corresponde.
    const lineSubtotal = (l: CartLine) => round2(l.quantity * effectiveUnit(l));

    // Procedimientos disponibles: excluimos peeling (flujo aparte).
    const availableProcedures = useMemo(
        () => procedures.filter((p) => p.code !== PEELING_PROTOCOLO_CODE),
        [procedures]
    );

    /**
     * Siembra del carrito al abrir. El ref evita re-sembrar en cada render
     * mientras el diálogo está abierto: sin él, cualquier cambio de estado
     * pisaría lo que el usuario viene editando (y podría duplicar líneas).
     * Se rearma recién cuando el diálogo se cierra.
     */
    const seededRef = useRef(false);

    useEffect(() => {
        if (!open) {
            seededRef.current = false;
            return;
        }
        if (seededRef.current) return;
        seededRef.current = true;

        if (seedLines && seedLines.length > 0) {
            setLines(
                seedLines.map((s) => ({
                    uid: nextUid(),
                    kind: "PRODUCT" as const,
                    productId: s.productId,
                    description: s.description,
                    quantity: s.quantity,
                    unitAmount: s.unitAmount,
                    performedBy: s.performedBy,
                }))
            );
        }
    }, [open, seedLines]);

    // Al agregar un ítem, baja al final del carrito para que se vea el nuevo.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const id = setTimeout(() => {
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        }, 120);
        return () => clearTimeout(id);
    }, [lines.length]);

    const q = query.trim().toLowerCase();
    const filteredProducts = useMemo(
        () =>
            (q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products).slice(0, 25),
        [products, q]
    );
    const filteredProcedures = useMemo(
        () =>
            (q
                ? availableProcedures.filter((p) => p.label.toLowerCase().includes(q))
                : availableProcedures
            ).slice(0, 25),
        [availableProcedures, q]
    );

    const total = useMemo(
        () => lines.reduce((acc, l) => acc + lineSubtotal(l), 0),
        [lines, isCashDiscount]
    );

    // Ahorro total por descuento efectivo (para mostrarlo).
    const cashSavings = useMemo(() => {
        if (!isCashDiscount) return 0;
        return lines.reduce((acc, l) => {
            if (l.kind !== "PRODUCT") return acc;
            return acc + l.quantity * l.unitAmount * CASH_PRODUCT_DISCOUNT;
        }, 0);
    }, [lines, isCashDiscount]);

    const addProduct = (p: ProductWithStock) => {
        setLines((prev) => {
            const existing = prev.find(
                (l) => l.kind === "PRODUCT" && l.productId === p.id
            );
            if (existing) {
                return prev.map((l) =>
                    l.uid === existing.uid ? { ...l, quantity: l.quantity + 1 } : l
                );
            }
            return [
                ...prev,
                {
                    uid: nextUid(),
                    kind: "PRODUCT",
                    productId: p.id,
                    description: p.name,
                    quantity: 1,
                    unitAmount: Number(p.salePrice ?? 0),
                    performedBy: performer.actor,
                },
            ];
        });
        setPickerOpen(false);
        setQuery("");
    };

    const addProcedure = (proc: ProcedureOption) => {
        setLines((prev) => {
            const existing = prev.find(
                (l) => l.kind === "PROCEDURE" && l.procedureCode === proc.code
            );
            if (existing) {
                return prev.map((l) =>
                    l.uid === existing.uid ? { ...l, quantity: l.quantity + 1 } : l
                );
            }
            return [
                ...prev,
                {
                    uid: nextUid(),
                    kind: "PROCEDURE",
                    procedureCode: proc.code,
                    description: proc.label,
                    quantity: 1,
                    unitAmount: Number(proc.amount ?? 0),
                    doctorSharePercent: defaultDoctorSharePercent,
                    cosmetologistSharePercent: defaultCosmetologistSharePercent,
                },
            ];
        });
        setPickerOpen(false);
        setQuery("");
    };

    const patchLine = (uid: string, patch: Partial<CartLine>) => {
        setLines((prev) =>
            prev.map((l) => (l.uid === uid ? ({ ...l, ...patch } as CartLine) : l))
        );
    };

    const removeLine = (uid: string) => {
        setLines((prev) => prev.filter((l) => l.uid !== uid));
    };

    const reset = () => {
        setLines([]);
        setComment("");
        setPaymentMethod("CASH");
        setAttempted(false);
        setQuery("");
    };

    // Validación: producto en consultorio necesita "realizado por".
    const missingPerformer = (l: CartLine) =>
        isConsultorio && l.kind === "PRODUCT" && !l.performedBy;

    const invalidLines = useMemo(
        () => lines.filter((l) => missingPerformer(l) || l.quantity <= 0 || l.unitAmount <= 0),
        [lines, isConsultorio]
    );

    const handleSubmit = async () => {
        setAttempted(true);

        if (lines.length === 0) {
            toast.error("Agregá al menos un ítem");
            return;
        }

        if (invalidLines.length > 0) {
            const first = invalidLines[0];
            lineRefs.current[first.uid]?.scrollIntoView({ behavior: "smooth", block: "center" });
            if (missingPerformer(first)) {
                toast.error("Elegí quién realizó la venta en los productos marcados");
            } else {
                toast.error("Revisá cantidades y montos: deben ser mayores a cero");
            }
            return;
        }

        const items: CombinedSaleItemRequest[] = lines.map((l) => {
            const subtotal = lineSubtotal(l);
            const unit = effectiveUnit(l);

            if (l.kind === "PRODUCT") {
                return {
                    kind: "PRODUCT",
                    productId: l.productId,
                    procedureCode: null,
                    description: l.description,
                    quantity: l.quantity,
                    unitAmount: unit,
                    subtotal,
                    // Blindaje: un rol bloqueado no registra a nombre de otra.
                    performedBy: performer.locked ? performer.actor : l.performedBy,
                    doctorSharePercent: null,
                    cosmetologistSharePercent: null,
                };
            }
            return {
                kind: "PROCEDURE",
                productId: null,
                procedureCode: l.procedureCode,
                description: l.description,
                quantity: l.quantity,
                unitAmount: l.unitAmount,
                subtotal,
                // Autoria del procedimiento: si la cosmetologa se lleva parte,
                // lo hizo ella. Si no, es de quien esta operando el sistema.
                performedBy:
                    l.cosmetologistSharePercent > 0 ? "COSMETOLOGA" : performer.actor,
                doctorSharePercent: l.doctorSharePercent,
                cosmetologistSharePercent: l.cosmetologistSharePercent,
            };
        });

        const payload: CombinedSaleRequest = {
            context,
            paymentMethod,
            comment: comment.trim() || null,
            performedBy: performer.actor,
            expectedTotal: round2(total),
            items,
        };

        try {
            await combinedSale(payload).unwrap();
            toast.success("Venta combinada registrada");
            reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(error?.data?.message || "No se pudo registrar la venta");
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) reset();
                onOpenChange(v);
            }}
        >
            <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Venta combinada
                    </DialogTitle>
                </DialogHeader>

                {/* Zona scrolleable: combobox + carrito */}
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                    {/* Combobox único: productos + procedimientos */}
                    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Plus className="h-4 w-4" />
                                Agregar producto o procedimiento
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] bg-white p-0 shadow-md"
                            align="start"
                            onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                            <div className="flex items-center gap-2 border-b px-3 py-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="max-h-72 overflow-auto py-1">
                                {filteredProducts.length > 0 && (
                                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                        Productos
                                    </div>
                                )}
                                {filteredProducts.map((p) => (
                                    <button
                                        key={`prod-${p.id}`}
                                        type="button"
                                        onClick={() => addProduct(p)}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                                    >
                                        <Package className="h-4 w-4 shrink-0 text-emerald-600" />
                                        <span className="flex-1 truncate">{p.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            Stock: {p.currentStock}
                                        </span>
                                    </button>
                                ))}

                                {filteredProcedures.length > 0 && (
                                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                        Procedimientos
                                    </div>
                                )}
                                {filteredProcedures.map((proc) => (
                                    <button
                                        key={`proc-${proc.code}`}
                                        type="button"
                                        onClick={() => addProcedure(proc)}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                                    >
                                        <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
                                        <span className="flex-1 truncate">{proc.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {currencyFormatter.format(Number(proc.amount ?? 0))}
                                        </span>
                                    </button>
                                ))}

                                {filteredProducts.length === 0 && filteredProcedures.length === 0 && (
                                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                        Sin resultados
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Carrito */}
                    {lines.length === 0 ? (
                        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                            Agregá productos o procedimientos a la venta
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lines.map((l) => {
                                const subtotal = lineSubtotal(l);
                                const baseSubtotal = l.quantity * l.unitAmount;
                                const hasDiscount = isCashDiscount && l.kind === "PRODUCT";
                                const performerError = attempted && missingPerformer(l);
                                return (
                                    <div
                                        key={l.uid}
                                        ref={(el) => {
                                            lineRefs.current[l.uid] = el;
                                        }}
                                        className="rounded-lg border p-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {l.kind === "PRODUCT" ? (
                                                    <Package className="h-4 w-4 shrink-0 text-emerald-600" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
                                                )}
                                                <span className="truncate text-sm font-medium">{l.description}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0"
                                                onClick={() => removeLine(l.uid)}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            <Field>
                                                <FieldLabel className="text-xs">Cantidad</FieldLabel>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={l.quantity}
                                                    onChange={(e) =>
                                                        patchLine(l.uid, {
                                                            quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                                                        } as Partial<CartLine>)
                                                    }
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel className="text-xs">
                                                    Precio {l.kind === "PRODUCT" ? "unitario" : ""}
                                                </FieldLabel>
                                                <Input
                                                    type="number"
                                                    value={l.unitAmount}
                                                    onChange={(e) =>
                                                        patchLine(l.uid, {
                                                            unitAmount: Number(e.target.value) || 0,
                                                        } as Partial<CartLine>)
                                                    }
                                                />
                                            </Field>

                                            {l.kind === "PRODUCT" && isConsultorio ? (
                                                <Field className="col-span-2">
                                                    <FieldLabel className="text-xs">Realizado por</FieldLabel>
                                                    {performer.locked ? (
                                                        <div className="flex h-9 w-full items-center gap-2 rounded-md border bg-muted/40 px-3">
                                                            <Badge variant="secondary">
                                                                {performer.label}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                detectado por tu usuario
                                                            </span>
                                                        </div>
                                                    ) : (
                                                    <Select
                                                        value={l.performedBy ?? ""}
                                                        onValueChange={(v) =>
                                                            patchLine(l.uid, { performedBy: v as CashActor } as Partial<CartLine>)
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className={
                                                                "w-full " +
                                                                (performerError ? "border-destructive ring-destructive" : "")
                                                            }
                                                        >
                                                            <SelectValue placeholder="Elegí quién realizó" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="MEDICA">Médica</SelectItem>
                                                            <SelectItem value="COSMETOLOGA">Cosmetóloga</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    )}
                                                    {!performer.locked && performerError && (
                                                        <span className="text-xs font-light text-destructive">
                                                            Elegí quién realizó la venta
                                                        </span>
                                                    )}
                                                </Field>
                                            ) : (
                                                <div className="col-span-2 flex flex-col justify-end">
                                                    <span className="text-xs text-muted-foreground">Subtotal</span>
                                                    <span className="text-sm font-semibold">
                                                        {hasDiscount && (
                                                            <span className="mr-1 text-xs font-normal text-muted-foreground line-through">
                                                                {currencyFormatter.format(baseSubtotal)}
                                                            </span>
                                                        )}
                                                        {currencyFormatter.format(subtotal)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {l.kind === "PRODUCT" && isConsultorio && (
                                            <div className="mt-2 flex items-center justify-end gap-1 text-sm">
                                                <span className="text-muted-foreground">Subtotal:</span>
                                                {hasDiscount && (
                                                    <span className="text-xs font-normal text-muted-foreground line-through">
                                                        {currencyFormatter.format(baseSubtotal)}
                                                    </span>
                                                )}
                                                <span className="font-semibold">
                                                    {currencyFormatter.format(subtotal)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Método de pago + comentario */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field>
                            <FieldLabel>Método de pago</FieldLabel>
                            <Select
                                value={paymentMethod}
                                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((m: { value: string; label: string }) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel>Comentario (opcional)</FieldLabel>
                            <Input
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Nota..."
                            />
                        </Field>
                    </div>
                </div>

                {/* Footer fijo: total + acciones (siempre visible) */}
                <div className="border-t px-6 py-4 space-y-3">
                    {cashSavings > 0 && (
                        <div className="flex items-center justify-between px-4 text-sm text-emerald-600 dark:text-emerald-400">
                            <span>Descuento efectivo (10% productos)</span>
                            <span>−{currencyFormatter.format(cashSavings)}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Total</span>
                            {isCard && (
                                <span className="text-xs text-muted-foreground">
                                    Se descontará la retención de tarjeta sobre el neto
                                </span>
                            )}
                        </div>
                        <span className="text-xl font-bold">{currencyFormatter.format(total)}</span>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting || lines.length === 0}>
                            {isSubmitting && <Spinner className="h-4 w-4" />}
                            Registrar venta
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}