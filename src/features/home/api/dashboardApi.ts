import { baseApi } from "@/core/api/baseApi";
import type { DashboardSummary } from "../models/dashboardSummary";
import type { CashKpiSummary } from "../models/cashKpiSummary";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query<DashboardSummary, void>({
      query: () => ({
        url: "/api/dashboard/summary",
        method: "GET",
      }),
    }),

    getCash: builder.query<CashKpiSummary, void>({
      query: () => ({
        url: "/api/dashboard/cash",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetSummaryQuery,
  useGetCashQuery,
} = dashboardApi;
