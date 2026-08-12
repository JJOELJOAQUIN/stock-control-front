import { baseApi } from "@/core/api/baseApi";

export type DailyCashSummary = {
  context: string;
  date: string;
  cashNet: number;
  transferNet: number;
  debitNet: number;
  creditNet: number;
  totalIn: number;
  totalOut: number;
  netTotal: number;
  closed: boolean;
  closedBy: string | null;
  closedAt: string | null;
  note: string | null;
};

export const cashCloseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDailyPreview: builder.query<
      DailyCashSummary,
      { context: string; date?: string }
    >({
      query: (arg) =>
        "/api/cash/close/preview?context=" + arg.context +
        (arg.date ? "&date=" + arg.date : ""),
      providesTags: ["CashClose"],
    }),

    getCloseHistory: builder.query<DailyCashSummary[], { context: string }>({
      query: (arg) => "/api/cash/close/history?context=" + arg.context,
      providesTags: ["CashClose"],
    }),

    closeCash: builder.mutation<
      DailyCashSummary,
      { context: string; date?: string; note?: string }
    >({
      query: (body) => ({
        url: "/api/cash/close",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CashClose", "Cash"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDailyPreviewQuery,
  useGetCloseHistoryQuery,
  useCloseCashMutation,
} = cashCloseApi;