import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supervisionMonthlyPaymentsApi } from "../api/supervisionMonthlyPayments";
import { MonthlyPeriodFilters, ResolveMonthlyDisputeInput } from "../types/supervisionMonthlyPayments";
import { showToast } from "../utils/toast";

export const supervisionMonthlyPaymentsQueryKeys = {
  all: ["supervisionMonthlyPayments"] as const,
  lists: () => [...supervisionMonthlyPaymentsQueryKeys.all, "list"] as const,
  list: (filters: MonthlyPeriodFilters) => [...supervisionMonthlyPaymentsQueryKeys.lists(), filters] as const,
  detail: (id: string) => [...supervisionMonthlyPaymentsQueryKeys.all, "detail", id] as const,
};

const retry = (failureCount: number, error: Error) => !error.message.includes("HTTP 401") && failureCount < 3;

export const useMonthlyPeriods = (filters: MonthlyPeriodFilters = {}) =>
  useQuery({
    queryKey: supervisionMonthlyPaymentsQueryKeys.list(filters),
    queryFn: () => supervisionMonthlyPaymentsApi.getPeriods(filters),
    staleTime: 1000 * 30,
    retry,
  });

export const useMonthlyPeriod = (id: string) =>
  useQuery({
    queryKey: supervisionMonthlyPaymentsQueryKeys.detail(id),
    queryFn: () => supervisionMonthlyPaymentsApi.getPeriod(id),
    enabled: !!id,
    staleTime: 0,
    retry,
  });

export const useResolveMonthlyDispute = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResolveMonthlyDisputeInput) => supervisionMonthlyPaymentsApi.resolveDispute(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(supervisionMonthlyPaymentsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: supervisionMonthlyPaymentsQueryKeys.lists() });
      showToast.success("Dispute resolved", "The month is settled: the Medical Director is paid and the rest refunded.");
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: supervisionMonthlyPaymentsQueryKeys.detail(id) });
      showToast.error("Action failed", error.message || "Please try again.");
    },
  });
};

/** Opens a disputed month's messages (recorded server-side), then refreshes who-looked on the detail. */
export const useMonthlyPeriodMessages = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => supervisionMonthlyPaymentsApi.getPeriodMessages(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supervisionMonthlyPaymentsQueryKeys.detail(id) });
    },
    onError: (error: Error) => {
      showToast.error("Couldn't open the messages", error.message || "Please try again.");
    },
  });
};
