import { baseApi } from "@/core/api/baseApi";
import type {
  CashContext,
  CashDailySplitResponse,
  CashCosmetologistSplitResponse,
  CashMovementResponse,
  CashMovementType,
  CashSource,
  CashSalesTotalsResponse,
  CreateCashMovementRequest,
  PageResponse,
} from "../types/cash.types";

export const cashApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCashMovement: builder.mutation<
      CashMovementResponse,
      CreateCashMovementRequest
    >({
      query: (body) => ({
        url: "/api/cash-movements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cash"],
    }),

    voidCashMovement: builder.mutation({
      query: (arg: { id: string; reason: string }) => ({
        url: "/api/cash-movements/" + arg.id + "/void",
        method: "POST",
        body: { reason: arg.reason },
      }),
      invalidatesTags: ["Cash"],
    }),

    

    getDailyCashSplit: builder.query<
      CashDailySplitResponse,
      { context: CashContext; date?: string }
    >({
      query: ({ context, date }) => {
        const params = new URLSearchParams();

        params.set("context", context);
        if (date) params.set("date", date);

        return {
          url: `/api/cash-movements/daily-split?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Cash"],
    }),

    getCosmetologistDailySplit: builder.query<
      CashCosmetologistSplitResponse,
      { context: CashContext; date?: string }
    >({
      query: ({ context, date }) => {
        const params = new URLSearchParams();

        params.set("context", context);
        if (date) params.set("date", date);

        return {
          url: `/api/cash-movements/daily-split/cosmetologist?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Cash"],
    }),

    getCashMovements: builder.query<
      PageResponse<CashMovementResponse>,
      {
        context?: CashContext;
        page?: number;
        size?: number;
        type?: CashMovementType;
        source?: CashSource;
        dateFrom?: string;
        dateTo?: string;
        q?: string;
      }
    >({
      query: ({ context, page = 0, size = 10, type, source, dateFrom, dateTo, q }) => {
        const params = new URLSearchParams();

        if (context) params.set("context", context);
        params.set("page", String(page));
        params.set("size", String(size));

        if (type) params.set("type", type);
        if (source) params.set("source", source);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        if (q && q.trim()) params.set("q", q.trim());

        return {
          url: `/api/cash-movements?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Cash"],
    }),

    

    getSalesTotals: builder.query<
      CashSalesTotalsResponse,
      { context: CashContext }
    >({
      query: ({ context }) => {
        const params = new URLSearchParams();
        params.set("context", context);

        return {
          url: `/api/cash-movements/sales-totals?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Cash"],
    }),
  }),
  overrideExisting: false,

  
});

export const {
  useCreateCashMovementMutation,
  useGetCashMovementsQuery,
  useGetDailyCashSplitQuery,
  useGetCosmetologistDailySplitQuery,
  useGetSalesTotalsQuery,
  useVoidCashMovementMutation,
} = cashApi;