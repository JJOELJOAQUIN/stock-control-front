import type { PaymentMethod, ProcedureOption } from "@/features/caja/types/cash.types";

/**
 * El código del peeling sigue viviendo acá porque CombinedSaleDialog lo usa
 * para excluirlo del carrito. El resto de la lógica de peeling (montos, cuotas
 * y reparto) se fue a features/treatments: el peeling se cobra como tratamiento
 * con paciente y saldo, no como un procedimiento suelto.
 */
export const PEELING_PROTOCOLO_CODE = "PEELING_PROFUNDO_PROTOCOLO";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

export function filterProcedures(procedures: ProcedureOption[], term: string) {
  const q = term.trim().toLowerCase();
  return q ? procedures.filter((p) => p.label.toLowerCase().includes(q)) : procedures;
}