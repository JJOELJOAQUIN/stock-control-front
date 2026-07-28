import { useMemo, useState } from "react";
import { ShoppingCart, ChevronRight, ChevronDown } from "lucide-react";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { currencyFormatter } from "@/lib/currencyFormatter";
import { useHasRole } from "@/features/auth/hooks/useRoles";
import { useGetMonthlyPurchasesQuery, type MonthlyPurchases, type PurchaseOrderRow } from "../api/purchaseApi";


function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  DEBIT: "Débito",
  CREDIT: "Crédito",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function PurchasesCard() {
  const [monthValue, setMonthValue] = useState(currentMonthValue());
  const [yearStr, monthStr] = monthValue.split("-");
  const [open, setOpen] = useState(false);

  // Las compras son de Pili: la cosmetóloga no ve esta card.
  const isCosmetologist = useHasRole(["COSMETOLOGA"]);

  const { data } = useGetMonthlyPurchasesQuery(
    { context: "CONSULTORIO", year: Number(yearStr), month: Number(monthStr) },
    { skip: isCosmetologist }
  );

  const purchases = data as MonthlyPurchases | undefined;

  const orders = useMemo(() => purchases?.orders ?? [], [purchases]);
  const totalSpent = Number(purchases?.totalSpent ?? 0);

  if (isCosmetologist) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <CardTitle>Compras del mes</CardTitle>
              <CardDescription>Lo que se gastó en mercadería e insumos.</CardDescription>
            </div>
          </div>
          <Input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className="w-full sm:w-44"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total gastado</p>
            <p className="mt-1 text-xl font-bold">{currencyFormatter.format(totalSpent)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Órdenes de compra</p>
            <p className="mt-1 text-xl font-bold">{orders.length}</p>
          </div>
        </div>

        {orders.length > 0 ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full rounded-lg border p-3 text-left transition hover:bg-muted/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Detalle de compras</p>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-sm">Ver cada orden y qué se compró.</p>
          </button>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sin compras registradas este mes.
          </p>
        )}
      </CardContent>

      <PurchasesDialog
        open={open}
        onOpenChange={setOpen}
        orders={orders}
        totalSpent={totalSpent}
      />
    </Card>
  );
}

function PurchasesDialog({
  open, onOpenChange, orders, totalSpent,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  orders: PurchaseOrderRow[];
  totalSpent: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Compras del mes</DialogTitle>
          <DialogDescription>
            Una fila por orden. Tocá una para ver qué se compró.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {orders.map((o) => (
            <OrderRow key={o.cashMovementId} order={o} />
          ))}
        </div>

        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total gastado</span>
            <span className="text-lg font-bold tabular-nums">
              {currencyFormatter.format(totalSpent)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrderRow({ order }: { order: PurchaseOrderRow }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b py-2 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          {expanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">{formatDate(order.date)}</span>
            <span className="truncate text-xs text-muted-foreground">
              {order.comment || "Sin comentario"} ·{" "}
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} ·{" "}
              {order.items.length} ítem{order.items.length === 1 ? "" : "s"}
            </span>
          </span>
        </span>
        <span className="shrink-0 tabular-nums font-semibold">
          {currencyFormatter.format(order.total)}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 rounded-md bg-muted/40 p-2">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <Badge variant="secondary">{it.quantity}</Badge>
                <span className="truncate">{it.productName}</span>
                {it.lotNumber && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    lote {it.lotNumber}
                  </span>
                )}
              </span>
              <span className="shrink-0 tabular-nums">
                {currencyFormatter.format(it.subtotal)}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({currencyFormatter.format(it.unitCost)} c/u)
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}