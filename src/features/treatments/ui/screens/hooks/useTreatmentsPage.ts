// features/treatments/hooks/useTreatmentsPage.ts
import { toast } from "sonner";


import {
  useGetTreatmentsQuery,
  useCreateTreatmentMutation,
} from "../api/treatmentsApi";
import type { CreateTreatmentRequest } from "../models/treatment";
import { useHasRole } from "@/features/auth/hooks/useRoles";

export function useTreatmentsPage() {
  // La médica registra; la cosmetóloga ve (read-only).
  const canRegister = useHasRole(["ADMIN"]);

  const {
    data: treatments = [],
    isLoading,
    refetch,
  } = useGetTreatmentsQuery({ context: "CONSULTORIO" });

  const [createTreatment, { isLoading: isCreating }] =
    useCreateTreatmentMutation();

  const registerTreatment = async (body: CreateTreatmentRequest) => {
    try {
      await createTreatment(body).unwrap();
      toast.success("Tratamiento registrado correctamente");
      refetch();
      return true;
    } catch (error: any) {
      toast.error(
        error?.data?.message || "No se pudo registrar el tratamiento"
      );
      return false;
    }
  };

  return {
    canRegister,
    treatments,
    isLoading,
    isCreating,
    registerTreatment,
  };
}