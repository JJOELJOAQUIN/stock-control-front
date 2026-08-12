import { baseApi } from "@/core/api/baseApi";

export type ProcedureKind = "MEDICA" | "COSMETOLOGIA";

/** Las tres formas de reparto válidas. Espejo del backend. */
export type ProcedureSplitRule = "MEDICA_100" | "COSMO_70_30" | "COSMO_50_50";

/** Cómo se consume el insumo: receta fija o flujo especial de vial. */
export type ProcedureSpecialFlow = "NONE" | "TOXINA_VIAL";

export type ProcedureCatalogItem = {
  id: string;
  code: string;
  label: string;
  kind: ProcedureKind;
  performer: "MEDICA" | "COSMETOLOGA";
  doctorPercent: number;
  cosmetologistPercent: number;
  amount: number | null;
  active: boolean;
  splitRule: ProcedureSplitRule;
  specialFlow: ProcedureSpecialFlow;
};

export type ProcedureCatalogPayload = {
  code: string;
  label: string;
  splitRule: ProcedureSplitRule;
  amount: number | null;
  specialFlow: ProcedureSpecialFlow;
};

/** Un renglón de la receta (BOM) tal como lo devuelve el backend. */
export type RecipeLine = {
  productId: string;
  productName: string;
  unit: string | null; // ML / AMPOLLA / DISPARO / UNIDAD
  quantity: number;
};

/** Lo que se manda al guardar la receta. */
export type RecipeLinePayload = {
  productId: string;
  quantity: number;
};

export const SPLIT_RULE_LABELS: Record<ProcedureSplitRule, string> = {
  MEDICA_100: "Médico · 100% médica",
  COSMO_70_30: "Cosmetología · 70% Gise / 30% médica",
  COSMO_50_50: "Cosmetología · 50% / 50%",
};

export const SPECIAL_FLOW_LABELS: Record<ProcedureSpecialFlow, string> = {
  NONE: "Receta fija (consumo automático)",
  TOXINA_VIAL: "Flujo especial de vial (toxina)",
};

export const procedureCatalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProcedureCatalog: builder.query<
      ProcedureCatalogItem[],
      { includeInactive?: boolean } | void
    >({
      query: (arg) =>
        "/api/procedure-catalog?includeInactive=" +
        (arg && arg.includeInactive ? "true" : "false"),
      providesTags: ["ProcedureCatalog"],
    }),

    createProcedure: builder.mutation<ProcedureCatalogItem, ProcedureCatalogPayload>({
      query: (body) => ({
        url: "/api/procedure-catalog",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProcedureCatalog"],
    }),

    updateProcedure: builder.mutation<
      ProcedureCatalogItem,
      { id: string; body: ProcedureCatalogPayload }
    >({
      query: ({ id, body }) => ({
        url: "/api/procedure-catalog/" + id,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ProcedureCatalog"],
    }),

    setProcedureActive: builder.mutation<
      ProcedureCatalogItem,
      { id: string; active: boolean }
    >({
      query: ({ id, active }) => ({
        url: "/api/procedure-catalog/" + id + "/active?active=" + (active ? "true" : "false"),
        method: "PATCH",
      }),
      invalidatesTags: ["ProcedureCatalog"],
    }),

    getRecipe: builder.query<RecipeLine[], string>({
      query: (id) => "/api/procedure-catalog/" + id + "/recipe",
      providesTags: (_r, _e, id) => [{ type: "ProcedureCatalog", id: "recipe-" + id }],
    }),

    setRecipe: builder.mutation<RecipeLine[], { id: string; lines: RecipeLinePayload[] }>({
      query: ({ id, lines }) => ({
        url: "/api/procedure-catalog/" + id + "/recipe",
        method: "PUT",
        body: lines,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "ProcedureCatalog", id: "recipe-" + id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProcedureCatalogQuery,
  useCreateProcedureMutation,
  useUpdateProcedureMutation,
  useSetProcedureActiveMutation,
  useGetRecipeQuery,
  useSetRecipeMutation,
} = procedureCatalogApi;