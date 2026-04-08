import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsletterApi, CreateNewsletterRequest, UpdateNewsletterRequest } from "@/services/api/newsletter";
import { showToast } from "@/services/utils/toast";

export const useNewsletters = (page = 1, limit = 10, status?: string) => {
  return useQuery({
    queryKey: ["newsletters", page, limit, status],
    queryFn: () => newsletterApi.getNewsletters(page, limit, status),
    staleTime: 2 * 60 * 1000,
  });
};

export const useNewsletter = (id: string) => {
  return useQuery({
    queryKey: ["newsletter", id],
    queryFn: () => newsletterApi.getNewsletter(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useNewsletterLogs = (id: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["newsletterLogs", id, page, limit],
    queryFn: () => newsletterApi.getLogs(id, page, limit),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useRecipientCount = (
  targetAudience: "all" | "job-seeker" | "employer",
  filters?: { country?: string; state?: string }
) => {
  return useQuery({
    queryKey: ["newsletterRecipientCount", targetAudience, filters],
    queryFn: () => newsletterApi.getRecipientCount(targetAudience, filters),
    enabled: !!targetAudience,
    staleTime: 30 * 1000,
  });
};

export const useCreateNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNewsletterRequest) => newsletterApi.createNewsletter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to create newsletter");
    },
  });
};

export const useUpdateNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNewsletterRequest }) =>
      newsletterApi.updateNewsletter(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["newsletter", id] });
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to update newsletter");
    },
  });
};

export const useDeleteNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsletterApi.deleteNewsletter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      showToast.success("Deleted", "Newsletter deleted successfully");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to delete newsletter");
    },
  });
};

export const useSendNewsletterNow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsletterApi.sendNow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["newsletter", id] });
      showToast.success("Sending", "Newsletter is being sent to recipients");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to send newsletter");
    },
  });
};

export const useScheduleNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      newsletterApi.scheduleNewsletter(id, scheduledAt),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["newsletter", id] });
      showToast.success("Scheduled", "Newsletter has been scheduled");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to schedule newsletter");
    },
  });
};

export const useCancelSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsletterApi.cancelSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["newsletter", id] });
      showToast.success("Cancelled", "Schedule has been cancelled");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to cancel schedule");
    },
  });
};
