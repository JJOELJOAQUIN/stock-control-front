import { baseApi } from "@/core/api/baseApi";

export type ShoppingListItem = {
  id: string;
  description: string;
  note?: string | null;
  context: "LOCAL" | "CONSULTORIO";
  productId?: string | null;
  done: boolean;
  doneAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
};

export const shoppingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShoppingList: builder.query({
      query: (arg: { context: string }) =>
        "/api/shopping-list?context=" + arg.context,
      providesTags: ["Shopping"],
    }),

    addShoppingItem: builder.mutation({
      query: (arg: {
        description: string;
        note?: string | null;
        context: string;
        productId?: string | null;
      }) => ({
        url: "/api/shopping-list",
        method: "POST",
        body: arg,
      }),
      invalidatesTags: ["Shopping"],
    }),

    toggleShoppingItem: builder.mutation({
      query: (arg: { id: string }) => ({
        url: "/api/shopping-list/" + arg.id + "/toggle",
        method: "POST",
      }),
      invalidatesTags: ["Shopping"],
    }),

    deleteShoppingItem: builder.mutation({
      query: (arg: { id: string }) => ({
        url: "/api/shopping-list/" + arg.id,
        method: "DELETE",
      }),
      invalidatesTags: ["Shopping"],
    }),

    clearDoneShoppingItems: builder.mutation({
      query: (arg: { context: string }) => ({
        url: "/api/shopping-list/done?context=" + arg.context,
        method: "DELETE",
      }),
      invalidatesTags: ["Shopping"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShoppingListQuery,
  useAddShoppingItemMutation,
  useToggleShoppingItemMutation,
  useDeleteShoppingItemMutation,
  useClearDoneShoppingItemsMutation,
} = shoppingApi;