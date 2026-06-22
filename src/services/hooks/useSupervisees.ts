import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { superviseeApi } from "../api/supervisee";
import {
  fetchSupervisionOptions,
  SUPERVISION_SUPERVISEE_OPTION_PARAMS,
  type SupervisionProfileOptionsParam,
} from "../api/supervisionOptions";
import {
  fetchSpecialtiesByOccupation,
  fetchSupervisorTypesData,
} from "../api/supervisorTypes";
import type { SuperviseeFilters } from "../types/supervisee";
import { showToast } from "../utils/toast";

export type SuperviseeFormOptionsParam = (typeof SUPERVISION_SUPERVISEE_OPTION_PARAMS)[number];

export const superviseeQueryKeys = {
  all: ["supervisees"] as const,
  lists: () => [...superviseeQueryKeys.all, "list"] as const,
  list: (filters: SuperviseeFilters) => [...superviseeQueryKeys.lists(), filters] as const,
  details: () => [...superviseeQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...superviseeQueryKeys.details(), id] as const,
};

export const superviseeFormOptionsQueryKeys = {
  byParam: (param: SuperviseeFormOptionsParam) => ["supervisee", "form-options", param] as const,
};

export const supervisorTypesQueryKey = ["supervisor-types-data"] as const;

export const useSupervisees = (filters: SuperviseeFilters = {}) => {
  return useQuery({
    queryKey: superviseeQueryKeys.list(filters),
    queryFn: () => superviseeApi.getSupervisees(filters),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useSuperviseeDetails = (id: string) => {
  return useQuery({
    queryKey: superviseeQueryKeys.detail(id),
    queryFn: () => superviseeApi.getSuperviseeById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useSupervisorTypesData = () => {
  return useQuery({
    queryKey: supervisorTypesQueryKey,
    queryFn: fetchSupervisorTypesData,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSpecialtiesByOccupation = (occupationId: string) => {
  return useQuery({
    queryKey: ["supervisee", "profile-specialty", occupationId],
    queryFn: () => fetchSpecialtiesByOccupation(occupationId),
    enabled: occupationId.length > 0,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSuperviseeFormOptions = () => {
  const queries = useQueries({
    queries: SUPERVISION_SUPERVISEE_OPTION_PARAMS.map((param) => ({
      queryKey: superviseeFormOptionsQueryKeys.byParam(param),
      queryFn: () => fetchSupervisionOptions(param as SupervisionProfileOptionsParam),
      staleTime: 1000 * 60 * 10,
    })),
  });

  return {
    formatOptions: queries[0].data ?? [],
    howSoonOptions: queries[1].data ?? [],
    availabilityOptions: queries[2].data ?? [],
    budgetTypeOptions: queries[3].data ?? [],
    isLoading: queries.some((q) => q.isLoading),
  };
};

export const useResendSuperviseeVerification = () => {
  return useMutation({
    mutationFn: (id: string) => superviseeApi.resendVerificationEmail(id),
    onSuccess: (response) => {
      showToast.success(
        "Verification Email Sent",
        response.message || "The verification email has been resent to the supervisee.",
      );
    },
    onError: (error: Error) => {
      showToast.error(
        "Resend Failed",
        error.message || "Failed to resend the verification email. Please try again.",
      );
    },
  });
};

export const useUpdateSupervisee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof superviseeApi.updateSupervisee>[1];
    }) => superviseeApi.updateSupervisee(id, payload),
    onSuccess: async (_response, { id }) => {
      showToast.success("Supervisee Updated", "Profile changes were saved successfully.");
      await queryClient.invalidateQueries({ queryKey: superviseeQueryKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: superviseeQueryKeys.detail(id) });
    },
    onError: (error: Error) => {
      showToast.error(
        "Update Failed",
        error.message || "Failed to update supervisee. Please try again.",
      );
    },
  });
};
