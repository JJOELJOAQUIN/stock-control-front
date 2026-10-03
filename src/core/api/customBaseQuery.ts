import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { logoutUser } from "../auth/helper/logoutHandler";
import { getAuth } from "firebase/auth";
import {
  isInsufficientStockError,
  requestStockReconcile,
} from "@/features/stock/reconcile/stockReconcileBridge";

const VITE_URL_API = import.meta.env.VITE_API_URL;
const VITE_BACKEND_FIREBASE_AUTH =
  import.meta.env.VITE_BACKEND_FIREBASE_AUTH === "true";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: VITE_URL_API,
  credentials: "include",
  jsonContentType: "application/json",
  prepareHeaders: async (headers) => {
    if (!VITE_BACKEND_FIREBASE_AUTH) return headers;

    const auth = getAuth();
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const MAX_RECONCILE_ATTEMPTS = 5;

const customFetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Stock insuficiente: ofrecer "Editar stock" y, si se corrigió, reintentar
  // la misma operación (el backend la había revertido entera, es seguro).
  // Una receta puede quedarse corta en más de un insumo: un diálogo por vez.
  for (let attempt = 0; attempt < MAX_RECONCILE_ATTEMPTS; attempt++) {
    const data = result.error?.status === 409 ? result.error.data : undefined;
    if (!isInsufficientStockError(data)) break;
    const reconciled = await requestStockReconcile(data);
    if (!reconciled) break;
    result = await rawBaseQuery(args, api, extraOptions);
  }

  if (result.error?.status === 401 || result.error?.status === 403) {
    await logoutUser();
  }

  return result;
};

export default customFetchBase;