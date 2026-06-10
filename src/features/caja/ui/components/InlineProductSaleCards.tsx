"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Barcode, Search, ShoppingBag, Package, Coins, Tag, TrendingUp } from "lucide-react";

import type {
  PaymentMethod,
  CashActor,
} from "../../types/cash.types";

import type { ProductScanResponse } from "@/features/stock/types/stock.types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PriceStat } from "./PriceStat";
import { currencyFormatter } from "@/lib/currencyFormatter";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

const SALE_ACTORS: { value: CashActor; label: string }[] = [
  { value: "COSMETOLOGA", label: "Cosmetóloga" },
  { value: "MEDICA", label: "Médica" },
];

type Props = {
  scannedProduct: ProductScanResponse | null;
  barcodeQuery: string;
  setBarcodeQuery: (value: string) => void;
  isScanning: boolean;
  isSelling: boolean;
  onScan: () => Promise<void>;
  onSell: (payload: {
    barcode: string;
    quantity: number;
    amount: number;
    paymentMethod: PaymentMethod;
    performedBy: CashActor;
    comment?: string;
  }) => Promise<void>;
};

export function InlineProductSaleCard({
  scannedProduct,
  barcodeQuery,
  setBarcodeQuery,
  isScanning,
  isSelling,
  onScan,
  onSell,
}: Props) {
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [performedBy, setPerformedBy] = useState<CashActor>("COSMETOLOGA");
  const [comment, setComment] = useState("");

  const handleSell = async (): Promise<void> => {
    if (!scannedProduct?.barcode) {
      toast.error("Primero escaneá un producto");
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

    await onSell({
      barcode: scannedProduct.barcode,
      quantity: parsedQty,
      amount: parsedAmount,
      paymentMethod,
      performedBy,
      comment:
        comment.trim() ||
        `Venta de producto desde caja consultorio - ${performedBy}`,
    });

    setQuantity("1");
    setAmount("");
    setComment("");
  };


  useEffect(() => {
    if (!scannedProduct) return

    const qty = Number(quantity)
    const unitPrice = Number(scannedProduct.salePrice ?? 0)

    if (Number.isFinite(qty) && qty > 0 && unitPrice > 0) {
      setAmount((qty * unitPrice).toFixed(2))
    }
  }, [scannedProduct, quantity])

  return (
    <Card className="border-emerald-200/30 dark:border-emerald-800/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <ShoppingBag className="size-5" />
          </div>

          <div>
            <CardTitle>Venta directa de producto</CardTitle>
            <CardDescription>
              Escaneá un producto y registrá la venta desde caja consultorio
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <InputGroup>
                <InputGroupAddon>
                  <Barcode className="size-4" />
                </InputGroupAddon>

                <InputGroupInput
                  value={barcodeQuery}
                  onChange={(e) => setBarcodeQuery(e.target.value)}
                  placeholder="Escanear o ingresar código de barras..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onScan();
                    }
                  }}
                />
              </InputGroup>
            </div>

            <Button
              variant="outline"
              onClick={onScan}
              disabled={!barcodeQuery.trim() || isScanning}
            >
              {isScanning ? <Spinner /> : <Search className="size-4" />}
              Buscar
            </Button>
          </div>

          {scannedProduct && (
            <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/20">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                    <Package className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>
                    <p className="font-semibold">{scannedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {scannedProduct.barcode} · {scannedProduct.scope}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    scannedProduct.belowMinimum ? "destructive" : "secondary"
                  }
                >
                  Stock: {scannedProduct.currentStock}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                  <FieldLabel>Monto Final</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </Field>

                <div className="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <PriceStat
                    icon={Coins}
                    label="Costo"
                    accent="neutral"
                    value={
                      scannedProduct.costPrice != null
                        ? currencyFormatter.format(scannedProduct.costPrice)
                        : "—"
                    }
                  />
                  <PriceStat
                    icon={Tag}
                    label="Precio público"
                    accent="emerald"
                    value={
                      scannedProduct.salePrice != null
                        ? currencyFormatter.format(scannedProduct.salePrice)
                        : "—"
                    }
                  />
                  <PriceStat
                    icon={TrendingUp}
                    label="Margen sugerido"
                    accent="amber"
                    value={
                      scannedProduct.defaultMarkupPercentage != null
                        ? `${scannedProduct.defaultMarkupPercentage}%`
                        : "—"
                    }
                    hint="sobre el costo"
                  />
                </div>

                <Field>
                  <FieldLabel>Método de pago</FieldLabel>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) =>
                      setPaymentMethod(v as PaymentMethod)
                    }
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
                  <Select
                    value={performedBy}
                    onValueChange={(v) =>
                      setPerformedBy(v as CashActor)
                    }
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

              <div className="mt-4 flex justify-end">
                <Button onClick={() => void handleSell()} disabled={isSelling}>
                  {isSelling && <Spinner />}
                  Registrar venta
                </Button>
              </div>
            </div>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}