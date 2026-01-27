import { baseApi } from "@/core/api/baseApi";
import type { GenericResponse } from "../models/afiliate";


export const afiliatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAfiliados: builder.mutation<
      GenericResponse,
      { filters: any }
    >({
      query: ({ filters}) => ({
        url: "/api/affiliates/",
        method: "POST",
        body: {
          card_name: filters.card_name || "",
          u_codigo_os: filters.u_codigo_os || "",
          u_nombre_a: filters.u_nombre_a || "",
          u_apellido_a: filters.u_apellido_a || "",
          limit: filters.limit || 50,
          offset: filters.offset || 0,
        },
      }),
    }),

    // Obtener órdenes de un afiliado
    getOrders: builder.mutation<
      GenericResponse,
      { u_nro_afiliado: string }
    >({
      query: ({ u_nro_afiliado}) => ({
        url: "/api/affiliates/orders/",
        method: "POST",
        body: { u_nro_afiliado },
      }),
    }),

    // Obtener detalles de una orden
    getOrderDetails: builder.mutation<
      GenericResponse,
      { doc_num: string;  }
    >({
      query: ({ doc_num }) => ({
        url: "/api/affiliates/orders/details/",
        method: "POST",
      
        body: { doc_num},
      }),
    }),
  }),

});

export const {
  useGetAfiliadosMutation,
  useGetOrdersMutation,
  useGetOrderDetailsMutation,
} = afiliatesApi;
