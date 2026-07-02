// features/treatments/api/patientsApi.ts
import { baseApi } from "@/core/api/baseApi";
import type { Patient, CreatePatientRequest } from "../models/treatment";

export const patientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchPatients: builder.query<Patient[], { term?: string }>({
      query: ({ term }) => {
        const params = new URLSearchParams();
        if (term && term.trim()) params.set("term", term.trim());
        return {
          url: `/api/patients?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Patient"],
    }),

    createPatient: builder.mutation<Patient, CreatePatientRequest>({
      query: (body) => ({
        url: "/api/patients",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Patient"],
    }),
  }),
});

export const {
  useSearchPatientsQuery,
  useLazySearchPatientsQuery,
  useCreatePatientMutation,
} = patientsApi;