import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "./apiUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SurveyJob {
  id: string;
  title: string;
  jobDescription: string | null;
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
  occupation: {
    id: number;
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

// ─── API Calls ────────────────────────────────────────────────────────────────

export const getSurveyJobs = async (params?: {
  page?: number;
  limit?: number;
  isPublished?: boolean;
}): Promise<SurveyJobListResponse> => {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.isPublished !== undefined) query.set("isPublished", String(params.isPublished));
  const qs = query.toString();
  return apiGet<SurveyJobListResponse>(`/api/admin/affiliates/survey-jobs${qs ? `?${qs}` : ""}`);
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
