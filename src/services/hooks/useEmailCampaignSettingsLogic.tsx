import { useCallback, useMemo, useState } from "react";
import { useEmailCampaignSettings, useUpdateEmailCampaignSetting } from "./useEmailCampaignSettings";
import type { EmailCampaignSetting, EmailCampaignSettingTableData } from "@/services/types/EmailCampaignSettingsTypes";

export const useEmailCampaignSettingsLogic = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: response, isLoading, error, refetch } = useEmailCampaignSettings();

  const updateCampaignMutation = useUpdateEmailCampaignSetting();

  const campaigns = useMemo(() => {
    const list = Array.isArray(response?.data) ? (response.data as EmailCampaignSetting[]) : [];

    const keyword = searchQuery.toLowerCase().trim();

    return list
      .map(
        (campaign): EmailCampaignSettingTableData => ({
          id: campaign.id,
          campaignKey: campaign.campaignKey,
          name: campaign.name,
          isEnabled: campaign.isEnabled,
          cronSchedule: campaign.cronSchedule,
          scheduleDescription: campaign.scheduleDescription,
          timezone: campaign.timezone,
          frequency: campaign.frequency,
          triggerType: campaign.triggerType,
          description: campaign.description || "",
          updatedAt: campaign.updatedAt,
        })
      )
      .filter((campaign) => {
        if (!keyword) return true;

        return (
          campaign.name.toLowerCase().includes(keyword) ||
          campaign.campaignKey.toLowerCase().includes(keyword) ||
          campaign.frequency.toLowerCase().includes(keyword) ||
          campaign.triggerType.toLowerCase().includes(keyword) ||
          campaign.timezone.toLowerCase().includes(keyword) ||
          campaign.description.toLowerCase().includes(keyword)
        );
      });
  }, [response, searchQuery]);

  const onSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const toggleCampaign = useCallback(
    async (campaignKey: string, isEnabled: boolean) => {
      await updateCampaignMutation.mutateAsync({
        campaignKey,
        payload: {
          isEnabled,
        },
      });

      refetch();
    },
    [updateCampaignMutation, refetch]
  );

  const updateCampaignSchedule = useCallback(
    async (campaignKey: string, payload: any) => {
      await updateCampaignMutation.mutateAsync({
        campaignKey,
        payload,
      });

      refetch();
    },
    [updateCampaignMutation, refetch]
  );

  return {
    campaigns,
    isLoading: isLoading || updateCampaignMutation.isPending,
    error,
    refetch,
    onSearch,
    toggleCampaign,
    updateCampaignSchedule,
    isUpdating: updateCampaignMutation.isPending,
  };
};
