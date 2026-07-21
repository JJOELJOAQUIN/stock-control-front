import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

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
import { PAYMENT_METHODS } from "@/lib/sale";
import { currencyFormatter } from "@/lib/currencyFormatter";
import type { PaymentMethod } from "@/features/caja/types/cash.types";
import { useGetProductsWithStockQuery } from "@/features/stock/api/stockApi";

import {
  DERMATO_PROCEDURES,
  splitFor,
  type BomTemplateLine,
} from "../models/dermatoCatalog";
import { useRegisterDermatoProcedureMutation } from "../api/dermatoApi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ConsumptionRow = {
  key: number;
  productId: string;
  quantity: string;
  label: string;
  unit: string;
  note?: string;
};

let rowKey = 0;

export function DermatoProcedureDialog({ open, onOpenChange }: Props) {
  const [procedureCode, setProcedureCode] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [comment, setComment] = useState("");
  const [rows, setRows] = useState<ConsumptionRow[]>([]);

  const { data: products = [] } = useGetProductsWithStockQuery({
    context: "CONSULTORIO",
  });

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const [register, { isLoading }] = useRegisterDermatoProcedureMutation();

  const selected = DERMATO_PROCEDURES.find((p) => p.code === procedureCode);

  const reset = () => {
    setProcedureCode("");
    setAmount("");
    setMethod("CASH");
    setComment("");
    setRows([]);
  };

  // Pre-selecciona el producto cuyo nombre contiene el hint del recetario.
  // Es una sugerencia: quien registra confirma o corrige en el select.
  const matchProduct = (line: BomTemplateLine): string => {
    const hit = sortedProducts.find((p) =>
      p.name.toLowerCase().includes(line.hint.toLowerCase())
    );
    return hit?.id ?? "";
  };

  const handleProcedureChange = (code: string) => {
    setProcedureCode(code);
    const proc = DERMATO_PROCEDURES.find((p) => p.code === code);
    if (!proc) return;
    setAmount(proc.amount > 0 ? String(proc.amount) : "");
    setRows(
      proc.bom.map((line) => ({
        key: rowKey++,
        productId: matchProduct(line),
        quantity: String(line.quantity),
        label: line.label,
        unit: line.unit,
        note: line.note,
      }))
    );
  };

  const updateRow = (key: number, patch: Partial<ConsumptionRow>) => {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const removeRow = (key: number) => {
    setRows((rs) => rs.filter((r) => r.key !== key));
  };

  const addRow = () => {
    setRows((rs) => [
      ...rs,
      { key: rowKey++, productId: "", quantity: "1", label: "Insumo", unit: "unidad" },
    ]);
  };

  const handleSubmit = async () => {
    if (!selected) {
      toast.error("Elegí el tratamiento");
      return;
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Ingresá el monto cobrado");
      return;
    }

    const consumptions = [];
    for (const row of rows) {
      const qty = Math.floor(Number(row.quantity));
      if (!row.productId) {
        toast.error(`Elegí el producto para "${row.label}" (o sacá la línea)`);
        return;
      }
      if (!Number.isFinite(qty) || qty <= 0) {
        toast.error(`Cantidad inválida en "${row.label}"`);
        return;
      }
      consumptions.push({ productId: row.productId, quantity: qty });
    }

    const split = splitFor(selected.kind);

    try {
      await register({
        procedureCode: selected.code,
        description: selected.label,
        amount: parsedAmount,
        paymentMethod: method,
        context: "CONSULTORIO",
        comment: comment.trim() || null,
        ...split,
        consumptions,
      }).unwrap();

      toast.success("Sesión registrada: caja e insumos descontados");
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar la sesión");
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
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Registrar sesión de tratamiento</DialogTitle>
          <DialogDescription>
            Cobra la sesión y descuenta los insumos del recetario (ml, ampollas,
            disparos) del stock.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="space-y-1.5">
            <Label>Tratamiento</Label>
            <Select value={procedureCode} onValueChange={handleProcedureChange}>
              <SelectTrigger>
                <SelectValue placeholder="Elegir tratamiento..." />
              </SelectTrigger>
              <SelectContent>
                {DERMATO_PROCEDURES.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.kind === "cosmetologia" ? "Gise · " : "Pili · "}
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Monto cobrado</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Método de pago</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger>
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
            </div>
          </div>

          {selected && (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Insumos de la sesión</p>
                <Button variant="ghost" size="sm" className="gap-1" onClick={addRow}>
                  <Plus className="size-4" />
                  Agregar insumo
                </Button>
              </div>

              {rows.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Sin insumos: se registra sólo la plata.
                </p>
              )}

              {rows.map((row) => (
                <div key={row.key} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <Select
                        value={row.productId}
                        onValueChange={(v) => updateRow(row.key, { productId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={row.label} />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} (stock {p.currentStock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      className="w-20"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                    />
                    <span className="w-16 text-xs text-muted-foreground">{row.unit}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRow(row.key)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {row.note && (
                    <p className="pl-1 text-xs text-muted-foreground">{row.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {selected && Number(amount) > 0 && (
            <p className="text-xs text-muted-foreground">
              Reparto:{" "}
              {selected.kind === "cosmetologia"
                ? `70% Gise / 30% Pili (${currencyFormatter.format(Number(amount) * 0.7)} a Gise)`
                : "100% Pili"}
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Comentario (opcional)</Label>
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Paciente, observaciones..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Registrar sesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}