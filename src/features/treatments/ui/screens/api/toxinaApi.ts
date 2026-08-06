// features/treatments/ui/screens/api/toxinaApi.ts
import { baseApi } from "@/core/api/baseApi";
import type { Treatment } from "../models/treatment";
import type {
  ToxinaSession,
  CreateToxinaTreatmentRequest,
  RegisterToxinaSessionRequest,
  OpenVialAlert,
} from "../models/toxina";

type RegisterSessionArgs = {
  id: string;
  body: RegisterToxinaSessionRequest;
};

export const toxinaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alta del tratamiento (el backend fija code = TOXINA_XEOMIN y pago único).
    createToxinaTreatment: builder.mutation<Treatment, CreateToxinaTreatmentRequest>({
      query: (body) => ({ url: "/api/toxina/treatments", method: "POST", body }),
      invalidatesTags: ["Treatment", "Cash"],
    }),

    // Sesión: abre/reusa vial, descuenta unidades y (si abre) baja 1 del stock.
    registerToxinaSession: builder.mutation<ToxinaSession, RegisterSessionArgs>({
      query: ({ id, body }) => ({
        url: `/api/toxina/treatments/${id}/sessions`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Toxina", "Stock", "Treatment"],
    }),

    getToxinaSessions: builder.query<ToxinaSession[], string>({
      query: (id) => ({ url: `/api/toxina/treatments/${id}/sessions`, method: "GET" }),
      providesTags: ["Toxina"],
    }),

    // Viales abiertos por vencer (día 10 de 20).
    getOpenVials: builder.query<OpenVialAlert[], void>({
      query: () => ({ url: "/api/alerts/open-vials", method: "GET" }),
      providesTags: ["Toxina"],
    }),
  }),
});

export const {
  useCreateToxinaTreatmentMutation,
  useRegisterToxinaSessionMutation,
  useGetToxinaSessionsQuery,
  useGetOpenVialsQuery,
} = toxinaApi;