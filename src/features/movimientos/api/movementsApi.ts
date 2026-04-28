import { baseApi } from "@/core/api/baseApi";
import type { MovementsQueryParams, PageResponse, StockMovementItem } from "../ui/types/movements.types";


function buildQuery(params: MovementsQueryParams) {
  const search = new URLSearchParams();

  search.set("productId", params.productId);
  search.set("context", params.context);

  if (params.type) search.set("type", params.type);
  if (params.reason) search.set("reason", params.reason);
  if (params.minQty != null) search.set("minQty", String(params.minQty));
  if (params.maxQty != null) search.set("maxQty", String(params.maxQty));
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.page != null) search.set("page", String(params.page));
  if (params.size != null) search.set("size", String(params.size));

  return search.toString();
}

export const movementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockMovements: builder.query<
      PageResponse<StockMovementItem>,
      MovementsQueryParams
    >({
      query: (params) => ({
        url: `/api/stock-movements?${buildQuery(params)}`,
        method: "GET",
      }),
      providesTags: ["Stock"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetStockMovementsQuery } = movementsApi;