import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailCampaignSettingsApi } from "../api/emailCampaignSettings";
import { showToast } from "../utils/toast";
import type { UpdateEmailCampaignSettingPayload } from "@/services/types/EmailCampaignSettingsTypes";

export const emailCampaignSettingsQueryKeys = {
  all: ["emailCampaignSettings"] as const,
  list: () => [...emailCampaignSettingsQueryKeys.all, "list"] as const,
  detail: (campaignKey: string) => [...emailCampaignSettingsQueryKeys.all, "detail", campaignKey] as const,
};

export const useEmailCampaignSettings = () => {
  return useQuery({
    queryKey: emailCampaignSettingsQueryKeys.list(),
    queryFn: () => emailCampaignSettingsApi.getEmailCampaignSettings(),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) return false;
      if (error.message.includes("HTTP 500")) return false;
      return failureCount < 3;
    },
  });
};

export const useEmailCampaignSetting = (campaignKey: string) => {
  return useQuery({
    queryKey: emailCampaignSettingsQueryKeys.detail(campaignKey),
    queryFn: () => emailCampaignSettingsApi.getEmailCampaignSetting(campaignKey),
    enabled: !!campaignKey,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateEmailCampaignSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignKey, payload }: { campaignKey: string; payload: UpdateEmailCampaignSettingPayload }) =>
      emailCampaignSettingsApi.updateEmailCampaignSetting(campaignKey, payload),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: emailCampaignSettingsQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: emailCampaignSettingsQueryKeys.detail(variables.campaignKey),
      });

      showToast.success(
        "Campaign Updated!",
        `"${data.data.name}" has been ${data.data.isEnabled ? "enabled" : "disabled"} successfully.`
      );
    },

    onError: (error: any) => {
      let errorMessage = "Failed to update email campaign setting.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast.error("Update Failed", errorMessage);
    },
  });
};
