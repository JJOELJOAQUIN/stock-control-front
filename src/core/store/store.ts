// src/core/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";

// inyección global del legacy baseApi
import "../api/injectedEndpoints";

import { commercialApi } from "@/features/commercial/api/commercialApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [commercialApi.reducerPath]: commercialApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware,
      commercialApi.middleware   // ← FALTABA ESTO
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
