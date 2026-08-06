import { useMemo } from "react";
import { toast } from "sonner";

import type { PaymentMethod } from "@/features/caja/types/cash.types";
import { useHasRole } from "@/features/auth/hooks/useRoles";

import {
  useGetTreatmentsQuery,
  useRegisterTreatmentPaymentMutation,
} from "../api/treatmentsApi";
import {
  useCreateToxinaTreatmentMutation,
  useRegisterToxinaSessionMutation,
  useGetOpenVialsQuery,
} from "../api/toxinaApi";
import { TOXINA } from "../models/toxina";

export type RegisterToxinaInput = {
  patientId: string;
  totalAmount: number;
  firstPaymentAmount: number | null;
  firstPaymentMethod: PaymentMethod | null;
};

export type RegisterSessionInput = {
  treatmentId: string;
  productId: string;
  sessionNumber: number;
  unitsUsed: number;
};

export function useToxinaPage() {
  // La toxina es médica: sólo ADMIN la registra.
  const canRegister = useHasRole(["ADMIN"]);

  const { data: allTreatments = [], isLoading, refetch } = useGetTreatmentsQuery();
  const treatments = useMemo(
    () => allTreatments.filter((t) => t.code === TOXINA.code),
    [allTreatments]
  );

  const { data: openVials = [] } = useGetOpenVialsQuery();

  const [createToxina, { isLoading: isCreating }] = useCreateToxinaTreatmentMutation();
  const [registerSession, { isLoading: isRegisteringSession }] =
    useRegisterToxinaSessionMutation();
  const [registerPayment, { isLoading: isPaying }] = useRegisterTreatmentPaymentMutation();

  // Alta del tratamiento + (opcional) pago único, orquestado en dos llamadas.
  const registerTreatment = async (input: RegisterToxinaInput) => {
    try {
      const created = await createToxina({
        patientId: input.patientId,
        totalAmount: input.totalAmount,
      }).unwrap();

      if (
        input.firstPaymentAmount &&
        input.firstPaymentAmount > 0 &&
        input.firstPaymentMethod
      ) {
        await registerPayment({
          id: created.id,
          body: {
            amount: input.firstPaymentAmount,
            paymentMethod: input.firstPaymentMethod,
            context: "CONSULTORIO",
            splitPreset: null,
          },
        }).unwrap();
      }

      toast.success("Tratamiento de toxina registrado");
      refetch();
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar el tratamiento");
      return false;
    }
  };

  const registerToxinaSession = async (input: RegisterSessionInput) => {
    try {
      await registerSession({
        id: input.treatmentId,
        body: {
          productId: input.productId,
          sessionNumber: input.sessionNumber,
          unitsUsed: input.unitsUsed,
          context: "CONSULTORIO",
        },
      }).unwrap();
      toast.success("Sesión registrada");
      refetch();
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar la sesión");
      return false;
    }
  };

  const addPayment = async (
    treatmentId: string,
    amount: number,
    paymentMethod: PaymentMethod
  ) => {
    try {
      await registerPayment({
        id: treatmentId,
        body: { amount, paymentMethod, context: "CONSULTORIO", splitPreset: null },
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
    openVials,
    isLoading,
    isCreating,
    isRegisteringSession,
    isPaying,
    registerTreatment,
    registerToxinaSession,
    addPayment,
  };
}