import { useQuery, useMutation, useQueryClient, useQueries, keepPreviousData, type QueryClient } from "@tanstack/react-query";
import { supervisorApi } from "../api/supervisor";
import {
  SUPERVISION_PROFILE_OPTION_PARAMS,
  SUPERVISION_SUPERVISOR_EDIT_OPTION_PARAMS,
  fetchSupervisionOptions,
  type SupervisionProfileOptionsParam,
} from "../api/supervisionOptions";
import type {
  SupervisorActionResponse,
  SupervisorDetailsResponse,
  SupervisorFilters,
  SupervisorProfile,
} from "../types/supervisor";
import { showToast } from "../utils/toast";

/** Merge PATCH approve/reject profile payload into cached detail so UI updates immediately and races cannot restore stale data. */
function patchSupervisorDetailCacheFromAction(
  queryClient: QueryClient,
  supervisorUserId: string,
  actionResponse: SupervisorActionResponse
) {
  const raw = actionResponse.data as SupervisorProfile & { user?: unknown };
  const { user: _user, ...profilePatch } = raw;

  queryClient.setQueryData<SupervisorDetailsResponse>(
    supervisorQueryKeys.detail(supervisorUserId),
    (old) => {
      if (!old?.success || !old.data) return old;
      const prev = old.data.supervisorProfile;
      return {
        ...old,
        data: {
          ...old.data,
          supervisorProfile: prev
            ? { ...prev, ...profilePatch }
            : ({ ...profilePatch } as SupervisorProfile),
        },
      };
    }
  );
}

export const supervisionOptionsQueryKeys = {
  byParam: (param: SupervisionProfileOptionsParam) => ["supervision", "options", param] as const,
};

export const supervisorQueryKeys = {
  all: ["supervisors"] as const,
  lists: () => [...supervisorQueryKeys.all, "list"] as const,
  list: (filters: SupervisorFilters) => [...supervisorQueryKeys.lists(), filters] as const,
  details: () => [...supervisorQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...supervisorQueryKeys.details(), id] as const,
};

export const useSupervisors = (filters: SupervisorFilters = {}) => {
  return useQuery({
    queryKey: supervisorQueryKeys.list(filters),
    queryFn: () => supervisorApi.getSupervisors(filters),
    // Keep the previous rows on screen while a new page/sort/filter loads,
    // so the table doesn't flash the full-body spinner on every change.
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useSupervisorDetails = (id: string) => {
  return useQuery({
    queryKey: supervisorQueryKeys.detail(id),
    queryFn: () => supervisorApi.getSupervisorById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/** Loads certificate, format, availability, and patient population option lists (cached). */
export const useSupervisionProfileDisplayOptions = () => {
  const queries = useQueries({
    queries: SUPERVISION_PROFILE_OPTION_PARAMS.map((param) => ({
      queryKey: supervisionOptionsQueryKeys.byParam(param),
      queryFn: () => fetchSupervisionOptions(param),
      staleTime: 1000 * 60 * 10,
    })),
  });

  return {
    certificateOptions: queries[0].data ?? [],
    formatOptions: queries[1].data ?? [],
    availabilityOptions: queries[2].data ?? [],
    patientPopulationOptions: queries[3].data ?? [],
  };
};

export const useSupervisorEditFormOptions = () => {
  const queries = useQueries({
    queries: SUPERVISION_SUPERVISOR_EDIT_OPTION_PARAMS.map((param) => ({
      queryKey: ["supervisor", "edit-options", param] as const,
      queryFn: () => fetchSupervisionOptions(param as SupervisionProfileOptionsParam),
      staleTime: 1000 * 60 * 10,
    })),
  });

  return {
    certificateOptions: queries[0].data ?? [],
    formatOptions: queries[1].data ?? [],
    availabilityOptions: queries[2].data ?? [],
    patientPopulationOptions: queries[3].data ?? [],
    feeTypeOptions: queries[4].data ?? [],
    isLoading: queries.some((q) => q.isLoading),
  };
};

export const useUpdateSupervisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof supervisorApi.updateSupervisor>[1];
    }) => supervisorApi.updateSupervisor(id, payload),
    onSuccess: async (_response, { id }) => {
      showToast.success("Supervisor Updated", "Profile changes were saved successfully.");
      await queryClient.invalidateQueries({ queryKey: supervisorQueryKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: supervisorQueryKeys.detail(id) });
    },
    onError: (error: Error) => {
      showToast.error(
        "Update Failed",
        error.message || "Failed to update supervisor. Please try again.",
      );
    },
  });
};

export const useApproveSupervisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, verificationNotes }: { id: string; verificationNotes?: string }) =>
      supervisorApi.approveSupervisor(id, verificationNotes),
    onSuccess: async (response, { id }) => {
      showToast.success("Supervisor Approved", "The supervisor has been approved successfully.");
      patchSupervisorDetailCacheFromAction(queryClient, id, response);
      await queryClient.invalidateQueries({ queryKey: supervisorQueryKeys.lists() });
      await queryClient.refetchQueries({ queryKey: supervisorQueryKeys.detail(id) });
    },
    onError: (error: Error) => {
      showToast.error("Approval Failed", error.message || "Failed to approve supervisor. Please try again.");
    },
  });
};

export const useRejectSupervisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, verificationNotes }: { id: string; verificationNotes: string }) =>
      supervisorApi.rejectSupervisor(id, verificationNotes),
    onSuccess: async (response, { id }) => {
      showToast.success("Supervisor Rejected", "The supervisor has been rejected.");
      patchSupervisorDetailCacheFromAction(queryClient, id, response);
      await queryClient.invalidateQueries({ queryKey: supervisorQueryKeys.lists() });
      await queryClient.refetchQueries({ queryKey: supervisorQueryKeys.detail(id) });
    },
    onError: (error: Error) => {
      showToast.error("Rejection Failed", error.message || "Failed to reject supervisor. Please try again.");
    },
  });
};

export const useResendSupervisorVerification = () => {
  return useMutation({
    mutationFn: (id: string) => supervisorApi.resendVerificationEmail(id),
    onSuccess: (response) => {
      showToast.success(
        "Verification Email Sent",
        response.message || "The verification email has been resent to the supervisor.",
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

export const useHideSupervisorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hideProfile }: { id: string; hideProfile: boolean }) =>
      supervisorApi.setHideProfile(id, hideProfile),
    onSuccess: async (response, { id }) => {
      const hidden = response.data?.hideProfile;
      showToast.success(
        hidden ? "Profile Hidden" : "Profile Visible",
        response.message ||
          (hidden
            ? "The supervisor's profile is now hidden."
            : "The supervisor's profile is now visible."),
      );
      await queryClient.invalidateQueries({ queryKey: supervisorQueryKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: supervisorQueryKeys.detail(id) });
    },
    onError: (error: Error) => {
      showToast.error(
        "Update Failed",
        error.message || "Failed to update profile visibility. Please try again.",
      );
    },
  });
};

export const useEditSupervisorVerificationNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, verificationNotes }: { id: string; verificationNotes: string }) =>
      supervisorApi.editSupervisorVerificationNotes(id, verificationNotes),
    onSuccess: async (response, { id }) => {
      showToast.success("Notes updated", "Verification notes were saved successfully.");
      patchSupervisorDetailCacheFromAction(queryClient, id, response);
      await queryClient.invalidateQueries({ queryKey: supervisorQueryKeys.lists() });
      await queryClient.refetchQueries({ queryKey: supervisorQueryKeys.detail(id) });
    },
    onError: (error: Error) => {
      showToast.error(
        "Update failed",
        error.message || "Failed to update verification notes. Please try again."
      );
    },
  });
};
