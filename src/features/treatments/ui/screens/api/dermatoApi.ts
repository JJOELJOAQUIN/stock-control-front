import { baseApi } from "@/core/api/baseApi";
import type { CashActor, PaymentMethod } from "@/features/caja/types/cash.types";

export type DermatoConsumptionLine = {
  productId: string;
  quantity: number;
};

export type DermatoProcedureRequest = {
  procedureCode: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  context: "CONSULTORIO";
  comment?: string | null;
  doctorSharePercent: number;
  cosmetologistSharePercent: number;
  performedBy: CashActor;
  consumptions: DermatoConsumptionLine[];
};

export const dermatoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerDermatoProcedure: builder.mutation<void, DermatoProcedureRequest>({
      query: (body) => ({
        url: "/api/business/dermato-procedure",
        method: "POST",
        body,
      }),
      // La sesión toca caja Y stock: se invalida todo lo derivado para que
      // la caja del día y las alertas de insumos se refresquen solas.
      invalidatesTags: ["Cash", "Stock", "Products"],
    }),
  }),
});

export const { useRegisterDermatoProcedureMutation } = dermatoApi;