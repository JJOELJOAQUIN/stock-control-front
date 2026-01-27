import { useGetOrdersMutation } from "../api/afiliateApi";

export function useAfiliadoOrders() {
  const [getOrders, { data, isLoading, isError, error }] =
    useGetOrdersMutation();

  const fetchOrders = async (u_nro_afiliado: string) => {
    try {
      const res = await getOrders({ u_nro_afiliado }).unwrap();
      return res;
    } catch (err) {
      console.error("Error al obtener órdenes del afiliado:", err);
      throw err;
    }
  };

  return {
    fetchOrders,
    data,
    isLoading,
    isError,
    error,
  };
}
