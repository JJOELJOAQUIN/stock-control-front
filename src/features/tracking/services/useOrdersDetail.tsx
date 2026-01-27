import { useGetOrderDetailsMutation } from "../api/afiliateApi";

export function useOrderDetails() {
  const [getOrderDetails, { data, isLoading, isError, error }] =
    useGetOrderDetailsMutation();

  const fetchOrderDetails = async (doc_num: string) => {
    const doc = doc_num.toString() || ""
    try {
      const res = await getOrderDetails({ doc_num: doc }).unwrap();
      return res;
    } catch (err) {
      console.error("Error al obtener detalles de la orden:", err);
      throw err;
    }
  };

  return {
    fetchOrderDetails,
    data,
    isLoading,
    isError,
    error,
  };
}
