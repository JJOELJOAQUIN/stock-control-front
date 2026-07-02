import { createApi } from "@reduxjs/toolkit/query/react";
import customBaseQuery from "./customBaseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  tagTypes: ["Products", "Stock", "Cash", "Users", "Treatment", "Patient"],
  endpoints: () => ({}), // se inyectan desde features
});
