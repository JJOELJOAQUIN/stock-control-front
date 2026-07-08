// features/treatments/api/treatmentsApi.ts
import { baseApi } from "@/core/api/baseApi";
import type {
  Treatment,
  TreatmentPayment,
  CreateTreatmentRequest,
  RegisterPaymentRequest,
} from "../models/treatment";

type RegisterPaymentArgs = {
  id: string;
  body: RegisterPaymentRequest;
};

export const treatmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTreatments: builder.query<Treatment[], { status?: string } | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && arg.status) params.set("status", arg.status);
        const qs = params.toString();
        return {
          url: `/api/treatments${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Treatment"],
    }),

    getTreatmentsByPatient: builder.query<Treatment[], string>({
      query: (patientId) => ({
        url: `/api/treatments/by-patient/${patientId}`,
        method: "GET",
      }),
      providesTags: ["Treatment"],
    }),

    getTreatment: builder.query<Treatment, string>({
      query: (id) => ({
        url: `/api/treatments/${id}`,
        method: "GET",
      }),
      providesTags: ["Treatment"],
    }),

    getTreatmentPayments: builder.query<TreatmentPayment[], string>({
      query: (id) => ({
        url: `/api/treatments/${id}/payments`,
        method: "GET",
      }),
      providesTags: ["Treatment"],
    }),

    createTreatment: builder.mutation<Treatment, CreateTreatmentRequest>({
      query: (body) => ({
        url: "/api/treatments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Treatment", "Cash"],
    }),

    registerTreatmentPayment: builder.mutation<TreatmentPayment, RegisterPaymentArgs>({
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
  useGetTreatmentsByPatientQuery,
  useLazyGetTreatmentsByPatientQuery,
  useGetTreatmentQuery,
  useGetTreatmentPaymentsQuery,
  useCreateTreatmentMutation,
  useRegisterTreatmentPaymentMutation,
} = treatmentsApi;