import { baseApi } from "@/core/api/baseApi";
import type { DashboardSummary } from "../models/dashboardSummary";
import type { CashKpiSummary } from "../models/cashKpiSummary";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSummaryByContext: builder.query<
      DashboardSummary,
      "LOCAL" | "CONSULTORIO"
    >({
      query: (context) => ({
        url: `/api/dashboard/summary?context=${context}`,
        method: "GET",
      }),
    }),

    getCashByContext: builder.query<
      CashKpiSummary,
      "LOCAL" | "CONSULTORIO"
    >({
      query: (context) => ({
        url: `/api/dashboard/cash/context?context=${context}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetSummaryByContextQuery,
  useGetCashByContextQuery,
} = dashboardApi;