import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { PaymentMethod } from "../../types/cash.types";

const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "TRANSFER",
  "DEBIT",
  "CREDIT",
];

type Props = {
  isSubmitting: boolean;
  onSubmit: (payload: {
    amount: number;
    paymentMethod: PaymentMethod;
    comment?: string;
  }) => Promise<void>;
};

export function ExpenseCard({ isSubmitting, onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    await onSubmit({
      amount: parsedAmount,
      paymentMethod,
      comment: comment.trim(),
    });

    setAmount("");
    setComment("");
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Egreso manual</h2>
        <p className="text-sm text-muted-foreground">
          Registrar salida de caja del consultorio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Monto</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Método de pago</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Comentario</Label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Motivo del egreso"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          Registrar egreso
        </Button>
      </div>
    </section>
  );
}