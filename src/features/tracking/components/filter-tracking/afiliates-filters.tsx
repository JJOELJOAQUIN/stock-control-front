import { defineFields, makeFilterWrapper } from "@/shared/components/generic-filter/filter-wrapper";
import { makeFiltersHook } from "@/shared/components/generic-filter/useFilters";


export type AfiliadosFilterPayload = {
  card_name?: string;
  u_codigo_os?: string;
  u_nombre_a?: string;
  u_apellido_a?: string;
  limit?: number;
  offset?: number;
};


const afiliadosFields = defineFields<AfiliadosFilterPayload>()([
  { name: "card_name", label: "Credencial", type: "text" },
  { name: "u_codigo_os", label: "Código OS", type: "text" },
  { name: "u_nombre_a", label: "Nombre", type: "text" },
  { name: "u_apellido_a", label: "Apellido", type: "text" },
]);


export const AfiliadosFilter = makeFilterWrapper<AfiliadosFilterPayload>({
  title: "Filtrar afiliados",
  fields: afiliadosFields,
  defaultValues: {
    card_name: "",
    u_codigo_os: "",
    u_nombre_a: "",
    u_apellido_a: "",
    limit: 50,
    offset: 0,
  },
  columns: 2,
});


export const useAfiliadosFilters = makeFiltersHook<AfiliadosFilterPayload>({
  initialActiveFields: afiliadosFields.map((f) => f.name),
});


export const mapAfiliadosFiltersToRequest = (filters: AfiliadosFilterPayload) => ({
  card_name: filters.card_name || "",
  u_codigo_os: filters.u_codigo_os || "",
  u_nombre_a: filters.u_nombre_a || "",
  u_apellido_a: filters.u_apellido_a || "",
  limit: filters.limit ?? 50,
  offset: filters.offset ?? 0,
});
