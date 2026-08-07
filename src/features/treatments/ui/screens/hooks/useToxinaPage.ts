import { useMemo } from "react";
import { toast } from "sonner";

import { useHasRole } from "@/features/auth/hooks/useRoles";
import { useGetProductsWithStockQuery } from "@/features/stock/api/stockApi";
import { useRegisterTreatmentPaymentMutation } from "../api/treatmentsApi";
import {
  useGetToxinaTreatmentsQuery,
  useCreateToxinaTreatmentMutation,
  useRegisterToxinaSessionMutation,
  useGetOpenVialsQuery,
} from "../api/toxinaApi";
import type {
  RegisterToxinaInput,
  RegisterSecondSessionInput,
} from "../models/toxina";

export function useToxinaPage() {
  // La toxina es médica: sólo ADMIN la registra.
  const canRegister = useHasRole(["ADMIN"]);

  const { data: treatments = [], isLoading } = useGetToxinaTreatmentsQuery();
  const { data: openVials = [] } = useGetOpenVialsQuery();

  // El vial de Xeomin sale del stock; se resuelve una vez y lo usan los dos flujos.
  const { data: products = [] } = useGetProductsWithStockQuery({ context: "CONSULTORIO" });
  const toxinaProductId = useMemo(
    () => products.find((p) => p.name.toUpperCase().includes("XEOMIN"))?.id ?? null,
    [products]
  );

  const [createToxina, { isLoading: isCreating }] = useCreateToxinaTreatmentMutation();
  const [registerSession, { isLoading: isRegisteringSession }] =
    useRegisterToxinaSessionMutation();
  const [registerPayment] = useRegisterTreatmentPaymentMutation();

  // Alta completa en un solo submit: tratamiento -> 1ª sesión -> (opcional) pago.
  const registerTreatment = async (input: RegisterToxinaInput) => {
    if (!toxinaProductId) {
      toast.error("No hay Xeomin cargado en stock");
      return false;
    }
    try {
      const created = await createToxina({
        patientId: input.patientId,
        totalAmount: input.totalAmount,
      }).unwrap();

      await registerSession({
        id: created.id,
        body: {
          productId: toxinaProductId,
          sessionNumber: 1,
          unitsUsed: input.firstSessionUnits,
          context: "CONSULTORIO",
        },
      }).unwrap();

      if (input.paymentAmount && input.paymentAmount > 0 && input.paymentMethod) {
        await registerPayment({
          id: created.id,
          body: {
            amount: input.paymentAmount,
            paymentMethod: input.paymentMethod,
            context: "CONSULTORIO",
            splitPreset: null,
          },
        }).unwrap();
      }

      toast.success("Tratamiento y 1ª sesión registrados");
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar el tratamiento");
      return false;
    }
  };

  // 2ª sesión: unidades + (opcional) el pago único, si todavía no se cobró.
  const registerSecondSession = async (input: RegisterSecondSessionInput) => {
    if (!toxinaProductId) {
      toast.error("No hay Xeomin cargado en stock");
      return false;
    }
    try {
      await registerSession({
        id: input.treatmentId,
        body: {
          productId: toxinaProductId,
          sessionNumber: 2,
          unitsUsed: input.units,
          context: "CONSULTORIO",
        },
      }).unwrap();

      if (input.paymentAmount && input.paymentAmount > 0 && input.paymentMethod) {
        await registerPayment({
          id: input.treatmentId,
          body: {
            amount: input.paymentAmount,
            paymentMethod: input.paymentMethod,
            context: "CONSULTORIO",
            splitPreset: null,
          },
        }).unwrap();
      }

      toast.success("2ª sesión registrada");
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "No se pudo registrar la sesión");
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
    registerTreatment,
    registerSecondSession,
  };
}