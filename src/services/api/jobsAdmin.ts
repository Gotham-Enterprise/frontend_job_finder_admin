import { JobsAdminFilters, JobsAdminResponse, JobsAdminDetailsResponse, OccupationsResponse } from "../types/jobsAdmin";
import { apiGet, apiPost, apiPut, apiDelete } from "./apiUtils";
import { AIJobDescriptionPayload, JobCreationPayload, AITonesProps } from "../types/jobCreation";

export type { AITonesProps, AIJobDescriptionPayload, JobCreationPayload };

export const AI_TONES = [
  { id: "formal" as AITonesProps, label: "Formal" },
  { id: "casual" as AITonesProps, label: "Casual" },
  { id: "enthusiastic" as AITonesProps, label: "Enthusiastic" },
  { id: "optimistic" as AITonesProps, label: "Optimistic" },
  { id: "conversational" as AITonesProps, label: "Conversational" },
  { id: "inspirational" as AITonesProps, label: "Inspirational" },
  { id: "informative" as AITonesProps, label: "Informative" },
  { id: "informal" as AITonesProps, label: "Informal" },
  { id: "persuasive" as AITonesProps, label: "Persuasive" },
  { id: "cooperative" as AITonesProps, label: "Cooperative" },
] as const;

export const jobsAdminApi = {
  async getJobs(filters: JobsAdminFilters = {}): Promise<JobsAdminResponse> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.name) queryParams.append("name", filters.name);
    if (filters.state) queryParams.append("state", filters.state);
    if (filters.city) queryParams.append("city", filters.city);
    if (filters.jobStatus) queryParams.append("jobStatus", filters.jobStatus);
    if (filters.datePosted) queryParams.append("datePosted", filters.datePosted);
    if (filters.occupationId) queryParams.append("occupationId", filters.occupationId.toString());
    if (filters.specialtyId) queryParams.append("specialtyId", filters.specialtyId.toString());
    if (filters.companyName) queryParams.append("companyName", filters.companyName);
    if (filters.isDeleted) queryParams.append("isDeleted", filters.isDeleted);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

    const endpoint = `/api/admin/jobs?${queryParams.toString()}`;

    return apiGet<JobsAdminResponse>(endpoint);
  },

  async getJobById(id: string): Promise<JobsAdminDetailsResponse> {
    return apiGet<JobsAdminDetailsResponse>(`/api/admin/jobs/${id}`);
  },

  async getJobForEdit(id: string): Promise<any> {
    return apiGet<any>(`/api/jobs/${id}`);
  },

  async getOccupations(): Promise<OccupationsResponse> {
    return apiGet<OccupationsResponse>("/api/categories/occupations?page=1&limit=0");
  },

  async softDeleteJob(id: string): Promise<{ success: boolean; message: string }> {
    return apiDelete<{ success: boolean; message: string }>(`/api/admin/jobs/${id}`);
  },
  async generateAIJobDescription(payload: AIJobDescriptionPayload): Promise<{
    success: boolean;
    data: {
      overview: string;
      responsibilities: string[];
      requirements: string[];
      benefits: string[];
    };
  }> {
    return apiPost<{
      success: boolean;
      data: {
        overview: string;
        responsibilities: string[];
        requirements: string[];
        benefits: string[];
      };
    }>("/api/ai/job-description", payload);
  },

  async createJob(
    companyId: string,
    payload: JobCreationPayload
  ): Promise<{ success: boolean; jobId?: string; message?: string }> {
    const transformedPayload = transformJobPayload(payload);

    try {
      const response = await apiPost<{ success: boolean; jobId?: string; message?: string }>(
        `/api/job_posts_management/admin/${companyId}`,
        transformedPayload
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateJob(
    companyId: string,
    jobPostId: string,
    payload: JobCreationPayload
  ): Promise<{ success: boolean; jobId?: string; message?: string }> {
    const transformedPayload = transformJobPayload(payload);

    try {
      const response = await apiPut<{ success: boolean; jobId?: string; message?: string }>(
        `/api/job_posts_management/admin/${companyId}/${jobPostId}`,
        transformedPayload
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export const transformJobPayload = (payload: JobCreationPayload): JobCreationPayload => {
  return {
    ...payload,

    locationCountry: payload.locationCountry === "US" ? "USA" : payload.locationCountry,
    workType: payload.workType?.toLowerCase().replace("-", "") || "full-time",
    workSetting: payload.workSetting?.toLowerCase().replace("-", "") || "onsite",
    workFacility: payload.workFacility?.toLowerCase() || "corporate",
    shiftType: payload.shiftType?.toLowerCase() || "morning",
    companySize: payload.companySize || "50-100",
    salaryRangeStart: Number(payload.salaryRangeStart),
    salaryRangeEnd: Number(payload.salaryRangeEnd),
    questions: payload.questions.map((q) => ({
      ...q,
      questionTypeId: Number(q.questionTypeId),
      questionSubTypeId: Number(q.questionSubTypeId),
      questionSubTypeValueId: q.questionSubTypeValueId ? Number(q.questionSubTypeValueId) : undefined,
    })),
  };
};
