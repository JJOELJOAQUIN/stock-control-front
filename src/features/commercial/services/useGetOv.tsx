import { useGetOvTotalQuery } from "../api/commercialApi";

export function useGetOv(params: string) {
  const { data, isLoading, isError, refetch } = useGetOvTotalQuery(params);

  const result = data?.values?.reduce(
    (acc: any, item: any) => {
      const { Cliente, Meses } = item;

      const base = Meses[0]?.Total ?? 0;
      const mesAnt = Meses[1]?.Total ?? 0;
      const acumMes = Meses[2]?.Total ?? 0;

      const diferenciaAnt = acumMes - mesAnt;
      const diferenciaBase = acumMes - base;

      const variacion =
        !base || isNaN(base)
          ? 0
          : Number((((acumMes - base) / base) * 100).toFixed(2));

      const variacionAnterior =
        !mesAnt || isNaN(mesAnt)
          ? 0
          : Number(((diferenciaAnt / mesAnt) * 100).toFixed(2));

      // push fila formateada
      acc.rows.push({
        Cliente,
        acumMes,
        mesAnt,
        base,
        diferenciaAnt,
        diferenciaBase,
        variacion,
        variacionAnterior,
      });

      // acumular totales
      acc.totalAcumulado += acumMes;
      acc.totalMesAnterior += mesAnt;
      acc.totalBase += base;

      return acc;
    },
    {
      rows: [],
      totalAcumulado: 0,
      totalMesAnterior: 0,
      totalBase: 0,
    }
  ) ?? {
    rows: [],
    totalAcumulado: 0,
    totalMesAnterior: 0,
    totalBase: 0,
  };

  return {
    data,
    formattedData: result.rows,
    totalAcumulado: result.totalAcumulado,
    totalMesAnterior: result.totalMesAnterior,
    totalBase: result.totalBase,
    isLoading,
    isError,
    refetch,
  };
}
