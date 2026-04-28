import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { logoutUser } from "../auth/helper/logoutHandler";
import { getAuth } from "firebase/auth";

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

const customFetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 || result.error?.status === 403) {
    await logoutUser();
  }

  return result;
};

export default customFetchBase;