import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "./apiUtils";
import type { Period, GroupBy } from "@/types/analytics";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SurveyJob {
  id: string;
  title: string;
  jobDescription?: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationZipCode: string | null;
  locationAddress: string | null;
  workType: string | null;
  workSetting: string | null;
  workFacility: string | null;
  salaryRangeStart: number;
  salaryRangeEnd: number;
  salaryType: string;
  salaryCurrency: string;
  isPublished: boolean;
  isJobPostOpen: boolean;
  externalJobPostUrl: string | null;
  datePosted: string;
  expiresAt: string | null;
  viewsCount: number;
  clicksCount: number;
  occupation: {
    id: number;
    name: string;
  } | null;
  affiliate?: {
    id: string;
    name: string;
  } | null;
}

export interface SurveyJobListResponse {
  data: SurveyJob[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateSurveyJobData {
  affiliatePartnerId: string;
  title: string;
  jobDescription?: string;
  occupationId: number;
  workType?: string;
  workSetting?: string;
  workFacility?: string;
  salaryType?: string;
  salaryRangeStart?: number;
  salaryRangeEnd?: number;
  salaryCurrency?: string;
  locationCity: string;
  locationState: string;
  locationCountry?: string;
  locationZipCode?: string;
  locationAddress?: string;
  isPublished?: boolean;
  datePosted?: string;
  expiresAt?: string;
}

export type UpdateSurveyJobData = Partial<CreateSurveyJobData>;

export interface SurveyJobTrendsData {
  period: string;
  categories: string[];
  clicks: {
    data: number[];
    total: number;
  };
  views: {
    data: number[];
    total: number;
  };
}

export interface SurveyJobTrendsResponse {
  success: boolean;
  data: SurveyJobTrendsData;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export type SurveyJobSortBy =
  | "views_desc"
  | "views_asc"
  | "date_desc"
  | "date_asc"
  | "clicks_desc"
  | "clicks_asc";

export const getSurveyJobs = async (params?: {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  search?: string;
  locationState?: string;
  locationCity?: string;
  affiliatePartnerId?: string;
  sortBy?: SurveyJobSortBy;
}): Promise<SurveyJobListResponse> => {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.isPublished !== undefined) query.set("isPublished", String(params.isPublished));
  if (params?.search) query.set("search", params.search);
  if (params?.locationState) query.set("locationState", params.locationState);
  if (params?.locationCity) query.set("locationCity", params.locationCity);
  if (params?.affiliatePartnerId) query.set("affiliatePartnerId", params.affiliatePartnerId);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  const qs = query.toString();
  return apiGet<SurveyJobListResponse>(`/api/admin/affiliates/survey-jobs${qs ? `?${qs}` : ""}`);
};

export const getSurveyJob = async (id: string): Promise<{ data: SurveyJob }> => {
  return apiGet<{ data: SurveyJob }>(`/api/admin/affiliates/survey-jobs/${id}`);
};

export const createSurveyJob = async (data: CreateSurveyJobData): Promise<{ data: SurveyJob }> => {
  return apiPost<{ data: SurveyJob }>("/api/admin/affiliates/survey-jobs", data);
};

export const updateSurveyJob = async (id: string, data: UpdateSurveyJobData): Promise<{ data: SurveyJob }> => {
  return apiPut<{ data: SurveyJob }>(`/api/admin/affiliates/survey-jobs/${id}`, data);
};

export const toggleSurveyJob = async (
  id: string,
  isPublished: boolean
): Promise<{ data: { id: string; isPublished: boolean } }> => {
  return apiPatch<{ data: { id: string; isPublished: boolean } }>(`/api/admin/affiliates/survey-jobs/${id}/toggle`, {
    isPublished,
  });
};

export const deleteSurveyJob = async (id: string): Promise<void> => {
  return apiDelete<void>(`/api/admin/affiliates/survey-jobs/${id}`);
};

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export const getSurveyJobTrends = async (params?: {
  period?: Period;
  groupBy?: GroupBy;
  customDateRange?: { startDate: string | null; endDate: string | null };
  affiliatePartnerId?: string;
}): Promise<SurveyJobTrendsResponse> => {
  const timezone = getTimezone();
  const period = params?.period ?? "3m";
  const query = new URLSearchParams();
  query.set("period", period);
  query.set("timezone", timezone);

  if (
    period === "custom" &&
    params?.customDateRange?.startDate &&
    params?.customDateRange?.endDate
  ) {
    query.set("startDate", params.customDateRange.startDate);
    query.set("endDate", params.customDateRange.endDate);
  }

  if (params?.groupBy) {
    query.set("groupBy", params.groupBy);
  }

  if (params?.affiliatePartnerId) {
    query.set("affiliatePartnerId", params.affiliatePartnerId);
  }

  return apiGet<SurveyJobTrendsResponse>(
    `/api/admin/affiliates/survey-jobs/trends?${query.toString()}`
  );
};
