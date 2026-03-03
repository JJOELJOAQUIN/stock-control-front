import {
  useGetSummaryByContextQuery,
  useGetCashByContextQuery,
} from "../api/dashboardApi";

export function useDashboardContext(context: "LOCAL" | "CONSULTORIO") {
  const summary = useGetSummaryByContextQuery(context);
  const cash = useGetCashByContextQuery(context);

  return {
    summary: summary.data,
    cash: cash.data,
    isLoading: summary.isLoading || cash.isLoading,
    isError: summary.isError || cash.isError,
  };
}