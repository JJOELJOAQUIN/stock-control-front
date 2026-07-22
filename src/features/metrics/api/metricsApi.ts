import { baseApi } from "@/core/api/baseApi";

export type ProcedureMetricRow = {
  procedureCode: string;
  count: number;
  amount: number;
  netAmount: number;
  doctorShare: number;
  cosmetologistShare: number;
};

export type MonthlyMetrics = {
  year: number;
  month: number;
  context: string;
  procedures: ProcedureMetricRow[];
  products: {
    count: number;
    amount: number;
    netAmount: number;
    doctorShare: number;
    cosmetologistShare: number;
  };
};

export const metricsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMonthlyMetrics: builder.query({
      query: (arg: { context: string; year: number; month: number }) =>
        "/api/metrics/monthly?context=" + arg.context +
        "&year=" + arg.year + "&month=" + arg.month,
      providesTags: ["Cash"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMonthlyMetricsQuery } = metricsApi;