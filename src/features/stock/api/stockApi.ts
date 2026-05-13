import { baseApi } from "@/core/api/baseApi";
import {
  type ProductBatchExpiration,
  type CreateProductRequest,
  type Product,
  type ProductScanResponse,
  type ProductWithStock,
  type PurchaseProductRequest,
  type SellByBarcodeRequest,
  type UpdateProductRequest,
} from "../types/stock.types";


export const stockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => ({
        url: "/api/products",
        method: "GET",
      }),
      providesTags: ["Products"],
    }),

    getProductsWithStock: builder.query<
      ProductWithStock[],
      { context: "LOCAL" | "CONSULTORIO" }
    >({
      query: ({ context }) => ({
        url: `/api/products/with-stock?context=${context}`,
        method: "GET",
      }),
      providesTags: ["Products", "Stock"],
    }),

    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (body) => ({
        url: "/api/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<
      Product,
      { id: string; body: UpdateProductRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Products", "Stock"],
    }),

    deactivateProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products", "Stock"],
    }),

    scanProductByBarcode: builder.query<
      ProductScanResponse,
      { barcode: string; context: "LOCAL" | "CONSULTORIO" }
    >({
      query: ({ barcode, context }) => ({
        url: `/api/products/scan?barcode=${encodeURIComponent(barcode)}&context=${context}`,
        method: "GET",
      }),
      providesTags: ["Stock"],
    }),

    purchaseProduct: builder.mutation<void, PurchaseProductRequest>({
      query: (body) => ({
        url: "/api/business/purchase",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products", "Stock", "Cash"],
    }),

    sellByBarcode: builder.mutation<void, SellByBarcodeRequest>({
      query: (body) => ({
        url: "/api/business/sell-by-barcode",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products", "Stock", "Cash"],
    }),

    getExpiringProductBatches: builder.query<
      ProductBatchExpiration[],
      { context: "LOCAL" | "CONSULTORIO"; days?: number }
    >({
      query: ({ context, days = 90 }) => ({
        url: `/api/product-batches/expiring?context=${context}&days=${days}`,
        method: "GET",
      }),
      providesTags: ["Stock"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductsWithStockQuery,
  useCreateProductMutation,
  useLazyScanProductByBarcodeQuery,
  usePurchaseProductMutation,
  useSellByBarcodeMutation,
  useUpdateProductMutation,
  useDeactivateProductMutation,
  useGetExpiringProductBatchesQuery,
} = stockApi;