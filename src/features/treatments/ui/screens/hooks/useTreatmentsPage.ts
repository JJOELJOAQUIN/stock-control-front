import { toast } from "sonner";
import type { PaymentMethod } from "@/features/caja/types/cash.types";

import {
  useGetTreatmentsQuery,
  useCreateTreatmentMutation,
  useRegisterTreatmentPaymentMutation,
} from "../api/treatmentsApi";
import type { CreateTreatmentRequest, SplitPreset } from "../models/treatment";
import { useHasRole } from "@/features/auth/hooks/useRoles";

// Lo que el dialog de alta arma: datos del tratamiento + primer pago opcional.
export type RegisterTreatmentInput = {
  treatment: CreateTreatmentRequest;
  firstPaymentAmount: number | null;
  firstPaymentMethod: PaymentMethod | null;
  // El primer pago es donde vive el caso "Gise se cobra la cuota entera", así
  // que el desvío tiene que poder elegirse ya en el alta y no sólo después.
  firstPaymentSplitPreset: SplitPreset | null;
};

export function useTreatmentsPage() {
  const canRegister = useHasRole(["ADMIN", "COSMETOLOGA"]);

  const {
    data: treatments = [],
    isLoading,
    refetch,
  } = useGetTreatmentsQuery();

  const [createTreatment, { isLoading: isCreating }] =
    useCreateTreatmentMutation();
  const [registerPayment, { isLoading: isPaying }] =
    useRegisterTreatmentPaymentMutation();

  // Alta de tratamiento + (opcional) primer pago, en dos llamadas orquestadas.
  const registerTreatment = async (input: RegisterTreatmentInput) => {
    try {
      const created = await createTreatment(input.treatment).unwrap();

      if (input.firstPaymentAmount && input.firstPaymentAmount > 0 && input.firstPaymentMethod) {
        await registerPayment({
          id: created.id,
          body: {
            amount: input.firstPaymentAmount,
            paymentMethod: input.firstPaymentMethod,
            context: "CONSULTORIO",
            splitPreset: input.firstPaymentSplitPreset ?? null,
          },
        }).unwrap();
      }

      toast.success("Tratamiento registrado");
      refetch();
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar el tratamiento");
      return false;
    }
  };

  // Registro de pago (segundo pago o cualquier cuota) desde la tabla.
  const addPayment = async (
    treatmentId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    splitPreset: SplitPreset | null = null
  ) => {
    try {
      await registerPayment({
        id: treatmentId,
        body: { amount, paymentMethod, context: "CONSULTORIO", splitPreset },
      }).unwrap();
      toast.success("Pago registrado");
      refetch();
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar el pago");
      return false;
    }
  };

  return {
    canRegister,
    treatments,
    isLoading,
    isCreating,
    isPaying,
    registerTreatment,
    addPayment,
  };
}