import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type {
    PaymentMethod,
    ProcedureOption,
} from "../../types/cash.types";

const PAYMENT_METHODS: PaymentMethod[] = [
    "CASH",
    "TRANSFER",
    "DEBIT",
    "CREDIT",
];

type Props = {
    title: string;
    description: string;
    procedures: ProcedureOption[];
    doctorSharePercent: number;
    cosmetologistSharePercent: number;
    isSubmitting: boolean;
    onSubmit: (payload: {
        procedure: ProcedureOption;
        amount: number;
        paymentMethod: PaymentMethod;
        comment?: string;
        doctorSharePercent: number;
        cosmetologistSharePercent: number;
    }) => Promise<void>;
};

export function ProcedureIncomeCard({
    title,
    description,
    procedures,
    doctorSharePercent,
    cosmetologistSharePercent,
    isSubmitting,
    onSubmit,
}: Props) {
    const initialProcedure = procedures[0];

    const [procedureCode, setProcedureCode] = useState(initialProcedure?.code ?? "");
    const [amount, setAmount] = useState(String(initialProcedure?.amount ?? 0));
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [comment, setComment] = useState("");

    const selectedProcedure = useMemo(
        () => procedures.find((p) => p.code === procedureCode),
        [procedures, procedureCode]
    );

    const handleProcedureChange = (code: string) => {
        setProcedureCode(code);

        const found = procedures.find((p) => p.code === code);
        if (found) {
            setAmount(String(found.amount));
        }
    };

    const handleSubmit = async () => {
        const parsedAmount = Number(amount);

        if (!selectedProcedure) {
            toast.error("Seleccioná un procedimiento");
            return;
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            toast.error("El monto debe ser mayor a cero");
            return;
        }

        await onSubmit({
            procedure: selectedProcedure,
            amount: parsedAmount,
            paymentMethod,
            comment: comment.trim(),
            doctorSharePercent,
            cosmetologistSharePercent,
        });

        setComment("");
    };

    return (
        <section className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Procedimiento</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={procedureCode}
                        onChange={(e) => handleProcedureChange(e.target.value)}
                    >
                        {procedures.map((item) => (
                            <option key={item.code} value={item.code}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

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

                <div className="space-y-2 md:col-span-3">
                    <Label>Comentario</Label>
                    <Input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Opcional"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
               <Button
                    className="ml-auto"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    Registrar ingreso
                </Button>
            </div>
        </section>
    );
}