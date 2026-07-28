import { baseApi } from "@/core/api/baseApi";

export type PurchaseItemRow = {
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  lotNumber: string | null;
  expirationDate: string | null;
};

export type PurchaseOrderRow = {
  cashMovementId: string;
  date: string;
  paymentMethod: string;
  comment: string | null;
  total: number;
  items: PurchaseItemRow[];
};

export type MonthlyPurchases = {
  year: number;
  month: number;
  context: string;
  totalSpent: number;
  orders: PurchaseOrderRow[];
};

export const purchasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMonthlyPurchases: builder.query({
      query: (arg: { context: string; year: number; month: number }) =>
        "/api/purchases/monthly?context=" + arg.context +
        "&year=" + arg.year + "&month=" + arg.month,
      providesTags: ["Cash"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMonthlyPurchasesQuery } = purchasesApi;