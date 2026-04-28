import { baseApi } from "@/core/api/baseApi";
import type {
  CashContext,
  CashMovementResponse,
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

    getCashMovements: builder.query<
      PageResponse<CashMovementResponse>,
      { context?: CashContext; page?: number; size?: number }
    >({
      query: ({ context, page = 0, size = 10 }) => {
        const params = new URLSearchParams();

        if (context) params.set("context", context);
        params.set("page", String(page));
        params.set("size", String(size));

        return {
          url: `/api/cash-movements?${params.toString()}`,
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
} = cashApi;