import { apiGet, apiPatch } from "./apiUtils";
import type {
  EmailCampaignSetting,
  UpdateEmailCampaignSettingPayload,
} from "@/services/types/EmailCampaignSettingsTypes";

export interface EmailCampaignSettingsResponse {
  success: boolean;
  data: EmailCampaignSetting[];
  message?: string;
}

export interface EmailCampaignSettingResponse {
  success: boolean;
  data: EmailCampaignSetting;
  message?: string;
}

export const emailCampaignSettingsApi = {
  async getEmailCampaignSettings(): Promise<EmailCampaignSettingsResponse> {
    return apiGet<EmailCampaignSettingsResponse>("/api/admin/users/email-campaign-settings");
  },

  async getEmailCampaignSetting(campaignKey: string): Promise<EmailCampaignSettingResponse> {
    return apiGet<EmailCampaignSettingResponse>(`/api/admin/users/${campaignKey}/email-campaign-settings`);
  },

  async updateEmailCampaignSetting(
    campaignKey: string,
    payload: UpdateEmailCampaignSettingPayload
  ): Promise<EmailCampaignSettingResponse> {
    return apiPatch<EmailCampaignSettingResponse>(`/api/admin/users/${campaignKey}/email-campaign-settings`, payload);
  },
};
