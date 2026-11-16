import { apiGet } from "./apiUtils";

export interface AdCampaignSummary {
  from: string;
  to: string;
  platform: string;
  clicks: number;
  uniqueVisitors: number;
  jobSeekerRegistrations: number;
  employerRegistrations: number;
  conversionRate: number;
  campaigns: AdCampaignRow[];
}

export interface AdCampaignRow {
  platform: string;
  campaign: string;
  source: string;
  medium: string;
  clicks: number;
  uniques: number;
  jobSeekerConversions: number;
  employerConversions: number;
  conversionRate: number;
  landingPath: string;
}

export interface AdCampaignConversion {
  id: string;
  platform: string;
  source: string;
  medium: string;
  campaign: string;
  role: "job_seeker" | "employer" | null;
  convertedAt: string;
  clickedAt: string;
  landingPath: string;
  label: string | null;
}

export interface AdCampaignQuery {
  from?: string;
  to?: string;
  platform?: string;
  role?: string;
  page?: number;
  limit?: number;
}

function queryString(params: AdCampaignQuery) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export function getAdCampaignSummary(params: AdCampaignQuery) {
  return apiGet<{ success: boolean; data: AdCampaignSummary }>(
    `/api/admin/ad-campaigns/summary${queryString(params)}`
  );
}

export function getAdCampaignConversions(params: AdCampaignQuery) {
  return apiGet<{
    success: boolean;
    data: AdCampaignConversion[];
    metaData: { page: number; limit: number; totalCount: number; totalPages: number };
  }>(`/api/admin/ad-campaigns/conversions${queryString(params)}`);
}
