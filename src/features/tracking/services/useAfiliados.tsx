import usePagination from "@/shared/hooks/use-pagination";
import { useGetAfiliadosMutation } from "../api/afiliateApi";
import { mapAfiliadosFiltersToRequest } from "../components/filter-tracking/afiliates-filters";

export function useAfiliados() {
  const [getAfiliados, { data, isLoading, isError, error }] =
    useGetAfiliadosMutation();
  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    setPage,
    setRowsPerPage,
  } = usePagination();
  // const { filters } = useAfiliadosFilters();

  const fetchAfiliados = async (filters: any) => {
    try {
      const payload = mapAfiliadosFiltersToRequest(filters);

      const res = await getAfiliados({ filters: payload }).unwrap();
      return res;
    } catch (err) {
      console.error("Error al obtener afiliados:", err);
      throw err;
    }
  };

  

  return {
    fetchAfiliados,
    data,
    isLoading,
    isError,
    error,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    setPage,
    setRowsPerPage,
  };
}
