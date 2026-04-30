
import { useState } from "react";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import type { PaymentMethod } from "../../types/cash.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";



const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
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
    <Card className="border-rose-200/30 dark:border-rose-800/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
            <Receipt className="size-5" />
          </div>
          <div>
            <CardTitle>Egreso manual</CardTitle>
            <CardDescription>
              Registrar salida de caja del consultorio
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field>
              <FieldLabel>Monto</FieldLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </Field>

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
              <FieldLabel>Motivo del egreso</FieldLabel>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describir motivo..."
              />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950 dark:hover:text-rose-300"
            >
              {isSubmitting && <Spinner />}
              Registrar egreso
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
