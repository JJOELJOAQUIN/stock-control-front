// src/features/commercial/api/commercialApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type OvParams = {
  a?: string;
  b?: string;
  c?: string;
  s?: string;
};

export const commercialApi = createApi({
  reducerPath: "commercialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000",
  }),
  tagTypes: ["Commercial"],
  endpoints: (builder) => ({
    getOvTotal: builder.query<any, string>({
      query: (team) => ({
        url: `/api/bo/ovtotal-ytd/${team}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetOvTotalQuery } = commercialApi;
