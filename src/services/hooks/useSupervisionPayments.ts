import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supervisionPaymentsApi } from "../api/supervisionPayments";
import {
  BillingWeekFilters,
  BillingWeekResponse,
  LateEntryInput,
  ResolveDisputeInput,
} from "../types/supervisionPayments";
import { showToast } from "../utils/toast";

export const supervisionPaymentsQueryKeys = {
  all: ["supervisionPayments"] as const,
  lists: () => [...supervisionPaymentsQueryKeys.all, "list"] as const,
  list: (filters: BillingWeekFilters) => [...supervisionPaymentsQueryKeys.lists(), filters] as const,
  detail: (id: string) => [...supervisionPaymentsQueryKeys.all, "detail", id] as const,
  supervisor: (supervisorId: string) =>
    [...supervisionPaymentsQueryKeys.all, "supervisor", supervisorId] as const,
};

const retry = (failureCount: number, error: Error) =>
  !error.message.includes("HTTP 401") && failureCount < 3;

export const useBillingWeeks = (filters: BillingWeekFilters = {}) =>
  useQuery({
    queryKey: supervisionPaymentsQueryKeys.list(filters),
    queryFn: () => supervisionPaymentsApi.getBillingWeeks(filters),
    staleTime: 1000 * 30,
    retry,
  });

export const useBillingWeek = (id: string) =>
  useQuery({
    queryKey: supervisionPaymentsQueryKeys.detail(id),
    queryFn: () => supervisionPaymentsApi.getBillingWeek(id),
    enabled: !!id,
    staleTime: 0,
    retry,
  });

/** Week mutations return the refreshed week; the lists are refetched. */
const useWeekMutation = <TVariables>(
  id: string,
  mutationFn: (variables: TVariables) => Promise<BillingWeekResponse>,
  success: { title: string; message: string },
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.setQueryData(supervisionPaymentsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: supervisionPaymentsQueryKeys.lists() });
      showToast.success(success.title, success.message);
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: supervisionPaymentsQueryKeys.detail(id) });
      showToast.error("Action failed", error.message || "Please try again.");
    },
  });
};

export const useResolveDispute = (id: string) =>
  useWeekMutation(id, (input: ResolveDisputeInput) => supervisionPaymentsApi.resolveDispute(id, input), {
    title: "Dispute resolved",
    message: "The week is settled: the supervisor is paid and unused prepay refunded.",
  });

export const useAddLateEntry = (id: string) =>
  useWeekMutation(id, (input: LateEntryInput) => supervisionPaymentsApi.addLateEntry(id, input), {
    title: "Late session added",
    message: "The supervisee was asked to approve it.",
  });

export const useRetryLateEntryCharge = (id: string) =>
  useWeekMutation(
    id,
    (sessionId: string) => supervisionPaymentsApi.retryLateEntryCharge(id, sessionId),
    { title: "Charge retried", message: "Check the session's charge status below." },
  );

export const useSupervisorInAppPayments = (supervisorId: string) =>
  useQuery({
    queryKey: supervisionPaymentsQueryKeys.supervisor(supervisorId),
    queryFn: () => supervisionPaymentsApi.getSupervisorInAppPayments(supervisorId),
    enabled: !!supervisorId,
    retry,
  });

export const useSetSupervisorInAppPayments = (supervisorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) =>
      supervisionPaymentsApi.setSupervisorInAppPayments(supervisorId, enabled),
    onSuccess: (data) => {
      queryClient.setQueryData(supervisionPaymentsQueryKeys.supervisor(supervisorId), data);
      showToast.success(
        "In-app payments updated",
        data.data.inAppPaymentsPilot
          ? "This supervisor now sends hourly, in-app billed agreements."
          : "New agreements from this supervisor use monthly terms paid outside the app.",
      );
    },
    onError: (error: Error) => showToast.error("Update failed", error.message || "Please try again."),
  });
};
