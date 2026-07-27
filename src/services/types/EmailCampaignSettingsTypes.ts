export interface EmailCampaignSetting {
  id: number;
  campaignKey: string;
  name: string;
  isEnabled: boolean;
  cronSchedule: string;
  scheduleDescription: string;
  timezone: string;
  frequency: string;
  triggerType: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaignSettingTableData {
  id: number;
  campaignKey: string;
  name: string;
  isEnabled: boolean;
  cronSchedule: string;
  scheduleDescription: string;
  timezone: string;
  frequency: string;
  triggerType: string;
  description: string;
  updatedAt: string;
}

export interface UpdateEmailCampaignSettingPayload {
  isEnabled?: boolean;
  cronSchedule?: string;
  scheduleDescription?: string;
  timezone?: string;
  frequency?: string;
  triggerType?: string;
  description?: string;
}

export interface EmailCampaignSettingsResponse {
  success: boolean;
  data: EmailCampaignSetting[];
}

export interface EmailCampaignSettingResponse {
  success: boolean;
  message?: string;
  data: EmailCampaignSetting;
}
