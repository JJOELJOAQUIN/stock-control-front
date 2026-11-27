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

/**
 * Detalle por producto de lo que vendió la cosmetóloga en el mes.
 * Sin costo ni ganancia: lo consumen las dos vistas (la Dra para ver qué
 * vendió Gise, y Gise para su conteo). El costo es información de Pili.
 */
export type CosmetologistProductRow = {
  productId: string;
  name: string;
  count: number;      // unidades vendidas por Gise
  revenue: number;    // lo cobrado por esas ventas
  commission: number; // el 5% que le corresponde a Gise
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
  cosmetologistProductDetail: CosmetologistProductRow[];
};

/** Efectivo que la cosmetóloga le deja a la médica (una entrega). */
export type CosmoCashEntry = {
  id: string;
  date: string;       // YYYY-MM-DD
  amount: number;
  note: string | null;
  createdBy: string;  // email de quien lo cargó
  createdAt: string;
};

export type CosmoCashMonth = {
  year: number;
  month: number;
  total: number;
  entries: CosmoCashEntry[];
};

export const metricsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMonthlyMetrics: builder.query({
      query: (arg: { context: string; year: number; month: number }) =>
        "/api/metrics/monthly?context=" + arg.context +
        "&year=" + arg.year + "&month=" + arg.month,
      providesTags: ["Cash"],
    }),

    getCosmoCash: builder.query<CosmoCashMonth, { year: number; month: number }>({
      query: (arg) =>
        "/api/metrics/cosmetologist-cash?year=" + arg.year + "&month=" + arg.month,
      providesTags: ["CosmoCash"],
    }),

    addCosmoCash: builder.mutation<CosmoCashEntry, { amount: number; date?: string; note?: string }>({
      query: (body) => ({
        url: "/api/metrics/cosmetologist-cash",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CosmoCash"],
    }),

    deleteCosmoCash: builder.mutation<void, string>({
      query: (id) => ({
        url: "/api/metrics/cosmetologist-cash/" + id,
        method: "DELETE",
      }),
      invalidatesTags: ["CosmoCash"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMonthlyMetricsQuery,
  useGetCosmoCashQuery,
  useAddCosmoCashMutation,
  useDeleteCosmoCashMutation,
} = metricsApi;