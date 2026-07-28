import { baseApi } from "@/core/api/baseApi";

export type ProcedureMetricRow = {
  procedureCode: string;
  count: number;
  amount: number;
  netAmount: number;
  doctorShare: number;
  cosmetologistShare: number;
};

export type ProductDetailRow = {
  productId: string;
  name: string;
  count: number;
  revenue: number;    // lo cobrado (con descuento aplicado)
  cost: number;       // cantidad * costo unitario
  commission: number; // 5% de Gise cuando vendió ella
  profit: number;     // revenue - cost - commission (ganancia de Pili)
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
  productDetail: ProductDetailRow[];
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