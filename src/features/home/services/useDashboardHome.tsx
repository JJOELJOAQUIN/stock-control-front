import { useGetSummaryQuery, useGetCashQuery } from "../api/dashboardApi";

export function useDashboardHome() {
  const summary = useGetSummaryQuery();
  const cash = useGetCashQuery();

  return {
    summary: summary.data,
    cash: cash.data,
    isLoading: summary.isLoading || cash.isLoading,
    isError: summary.isError || cash.isError,
  };
}
