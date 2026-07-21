import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Coins, Package, ShoppingBag, Tag } from "lucide-react";

import type { PaymentMethod, CashActor } from "../../types/cash.types";
import type { ProductScanResponse } from "@/features/stock/types/stock.types";

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
import { Badge } from "@/shared/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { PriceStat } from "./PriceStat";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { calcSale, PAYMENT_METHODS, SALE_ACTORS } from "@/lib/sale";
import { useHasRole } from "@/features/auth/hooks/useRoles";
import { usePerformer } from "@/features/caja/hooks/usePerformer";




type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: ProductScanResponse | null;
    isSelling: boolean;
    onSell: (payload: {
        barcode: string;
        quantity: number;
        amount: number;
        paymentMethod: PaymentMethod;
        performedBy: CashActor;
        comment?: string;
    }) => Promise<void>;
};

export function ProductSaleDialog({
    open,
    onOpenChange,
    product,
    isSelling,
    onSell,
}: Props) {
    const [quantity, setQuantity] = useState("1");
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    // Quien vende sale del usuario logueado como DEFAULT: la cosmetóloga
    // arranca en COSMETOLOGA, la médica en MEDICA, y las dos pueden
    // cambiarlo (cada una a veces carga ventas que hizo la otra).
    // Como siempre hay un valor, no existe el estado "sin elegir" y la
    // validación de vacío que había acá se fue con él.
    const performer = usePerformer();
    const [performedBy, setPerformedBy] = useState<CashActor>(performer.actor);
    const [comment, setComment] = useState("");

    const sale = calcSale(product, quantity, paymentMethod);
    const showSummary = sale.qty > 0 && sale.unitPrice > 0;

    // COSMETOLOGA no ve el costo de referencia.
    const canViewCost = useHasRole(["ADMIN", "USER"]);

    // Resetea el formulario cada vez que se abre el modal con un producto nuevo.
    useEffect(() => {
        if (open) {
            setQuantity("1");
            setAmount("");
            setComment("");
            setPerformedBy(performer.actor);
            setPaymentMethod("CASH");
        }
    }, [open, product?.id, performer.actor]);

    // Sugiere el monto en base al cálculo único.
    useEffect(() => {
        if (!open || !product) return;
        const { total } = calcSale(product, quantity, paymentMethod);
        if (total > 0) setAmount(total.toFixed(2));
    }, [open, product, quantity, paymentMethod]);

    const handleSell = async (): Promise<void> => {
        if (!product?.barcode) {
            toast.error("Producto inválido");
            return;
        }
        const parsedQty = Number(quantity);
        const parsedAmount = Number(amount);

        if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
            toast.error("La cantidad debe ser mayor a cero");
            return;
        }
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            toast.error("El monto debe ser mayor a cero");
            return;
        }

        // Blindaje: un rol bloqueado no puede registrar a nombre de otra.
        const actor: CashActor = performer.locked ? performer.actor : performedBy;

        await onSell({
            barcode: product.barcode,
            quantity: parsedQty,
            amount: parsedAmount,
            paymentMethod,
            performedBy: actor,
            comment:
                comment.trim() ||
                `Venta de producto desde caja consultorio - ${actor}`,
        });

        // Cierra el modal al registrar, igual que en la compra.
        onOpenChange(false);
    };

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[92vh] flex-col gap-0 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingBag className="size-5" />
                        Registrar venta
                    </DialogTitle>
                    <DialogDescription>
                        Confirmá los datos del producto y registrá la venta.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4 pr-1">
                    {/* Encabezado del producto */}
                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                                <Package className="size-5 text-emerald-600 dark:text-emerald-400" />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate font-semibold">{product.name}</span>
                                <span className="block text-sm text-muted-foreground">
                                    {product.barcode} · {product.scope}
                                </span>
                            </span>
                        </div>
                        <Badge variant={product.belowMinimum ? "destructive" : "secondary"}>
                            Stock: {product.currentStock}
                        </Badge>
                    </div>

                    {/* Precios de referencia */}
                    <div className={`grid gap-3 ${canViewCost ? "grid-cols-2" : "grid-cols-1"}`}>
                        {canViewCost && (
                            <PriceStat
                                icon={Coins}
                                label="Costo"
                                accent="neutral"
                                value={
                                    product.costPrice != null
                                        ? currencyFormatter.format(product.costPrice)
                                        : "—"
                                }
                            />
                        )}
                        <PriceStat
                            icon={Tag}
                            label="Precio público"
                            accent="emerald"
                            value={
                                product.salePrice != null
                                    ? currencyFormatter.format(product.salePrice)
                                    : "—"
                            }
                        />
                    </div>

                    {/* Cantidad + monto */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>Cantidad</FieldLabel>
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Monto final</FieldLabel>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                            />
                        </Field>
                    </div>

                    {/* Resumen calculado */}
                    {showSummary && (
                        <div className="flex flex-col gap-1 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Subtotal</span>
                                <span className="text-sm font-medium">
                                    {currencyFormatter.format(sale.subtotal)}
                                </span>
                            </div>
                            {sale.discountPercent > 0 && (
                                <div className="flex items-center justify-between text-sm text-rose-600">
                                    <span>-{sale.discountPercent}% off</span>
                                    <span>-{currencyFormatter.format(sale.discountAmount)}</span>
                                </div>
                            )}
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {sale.discountPercent > 0 ? "Total" : "Monto total"}
                                </span>
                                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                    {currencyFormatter.format(sale.total)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Método / responsable / comentario */}
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
                                {PAYMENT_METHODS.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel>Venta realizada por</FieldLabel>

                        {performer.locked ? (
                            <div className="flex h-9 w-full items-center gap-2 rounded-md border bg-muted/40 px-3">
                                <Badge variant="secondary">{performer.label}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    detectado por tu usuario
                                </span>
                            </div>
                        ) : (
                        <Select
                            value={performedBy}
                            onValueChange={(v) => setPerformedBy(v as CashActor)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                {SALE_ACTORS.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel>Comentario</FieldLabel>
                        <Input
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Opcional"
                        />
                    </Field>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={() => void handleSell()} disabled={isSelling}>
                        {isSelling && <Spinner />}
                        Registrar venta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}