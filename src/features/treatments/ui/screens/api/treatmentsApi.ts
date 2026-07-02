// features/treatments/api/treatmentsApi.ts
import { baseApi } from "@/core/api/baseApi";
import type { CashContext } from "@/features/caja/types/cash.types";
import type {
  Treatment,
  TreatmentPayment,
  CreateTreatmentRequest,
  RegisterPaymentRequest,
} from "../models/treatment";

export const treatmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTreatments: builder.query<
      Treatment[],
      { context: CashContext; pendingOnly?: boolean }
    >({
      query: ({ context, pendingOnly = false }) => {
        const params = new URLSearchParams();
        params.set("context", context);
        params.set("pendingOnly", String(pendingOnly));
        return {
          url: `/api/treatments?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Treatment"],
    }),

    createTreatment: builder.mutation<Treatment, CreateTreatmentRequest>({
      query: (body) => ({
        url: "/api/treatments",
        method: "POST",
        body,
      }),
      // El pago impacta caja: invalidamos Treatment y Cash.
      invalidatesTags: ["Treatment", "Cash"],
    }),

    registerTreatmentPayment: builder.mutation<
      TreatmentPayment,
      { id: string; body: RegisterPaymentRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/treatments/${id}/payments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Treatment", "Cash"],
    }),
  }),
});

export const {
  useGetTreatmentsQuery,
  useCreateTreatmentMutation,
  useRegisterTreatmentPaymentMutation,
} = treatmentsApi;