import { apiGet, apiPost } from "./apiUtils";

export interface SearchCandidateResult {
  id: string;
  name: string;
  email?: string;
  occupation: string;
  hasResume?: boolean;
}

export interface SearchJobResult {
  id: string;
  title: string;
  companyName: string;
  location: string;
  status: string;
}

export interface JobQuestion {
  id: string;
  questionText: string;
  required: boolean;
  questionType?: { id: number; name: string } | null;
  questionSubType?: { id: number; name: string } | null;
  questionSubTypeValue?: { id: number; value: string } | null;
  options: { id: string; optionText: string }[];
}

export interface CreateApplicationOnBehalfPayload {
  candidateId: string;
  jobId: string;
  answers?: { questionId: string; answerText: string }[];
}

export const adminApplicationApi = {
  async searchCandidates(query: string): Promise<{ success: boolean; data: SearchCandidateResult[] }> {
    const params = new URLSearchParams();
    params.append("name", query);
    params.append("limit", "10");
    params.append("page", "1");
    const response = await apiGet<{
      success: boolean;
      data: SearchCandidateResult[];
    }>(`/api/admin/jobseekers?${params.toString()}`);
    return response;
  },

  async searchJobs(query: string): Promise<{ success: boolean; data: SearchJobResult[] }> {
    const params = new URLSearchParams();
    params.append("name", query);
    params.append("limit", "10");
    params.append("page", "1");
    const response = await apiGet<{
      success: boolean;
      data: SearchJobResult[];
    }>(`/api/admin/jobs?${params.toString()}`);
    return response;
  },

  async getJobQuestions(jobId: string): Promise<{ success: boolean; data: JobQuestion[] }> {
    return apiGet<{ success: boolean; data: JobQuestion[] }>(
      `/api/admin/applications/job-questions/${encodeURIComponent(jobId)}`
    );
  },

  async createApplicationOnBehalf(
    payload: CreateApplicationOnBehalfPayload
  ): Promise<{ success: boolean; data: unknown }> {
    return apiPost<{ success: boolean; data: unknown }>(`/api/admin/applications/create-on-behalf`, payload);
  },
};
