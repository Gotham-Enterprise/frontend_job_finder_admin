import { JobsAdminFilters, JobsAdminResponse, JobsAdminDetailsResponse, OccupationsResponse } from '../types/jobsAdmin';
import { apiGet, apiPost } from './apiUtils';

export interface JobCreationPayload {
  companyId: string;
  jobTitle: string;
  occupationId: number;
  specialtyId: number;
  locationCountry: string;
  locationState: string;
  locationCity: string;
  locationZipCode: string;
  locationAddress: string;
  workType: string;
  workSetting: string;
  workFacility: string;
  salaryCurrency: string;
  salaryRangeStart: number;
  salaryRangeEnd: number;
  salaryType: string;
  autoRenew: boolean;
  shiftType: string;
  telemedicine?: string;
  languages: number[];
  companySize: string;
  postingDate: string;
  status: string;
  jobDescription: string;
  questions: Array<{
    questionText: string;
    questionTypeId: number;
    questionSubTypeId: number;
    questionSubTypeValueId?: number;
    required: boolean;
    isActive: boolean;
    isDefault: boolean;
    options?: string[];
  }>;
  documents: Array<{
    documentName: string;
    documentType: string;
    documentDescription: string;
  }>;
}

export type AITonesProps = 'formal' | 'casual' | 'enthusiastic' | 'optimistic' | 'conversational' | 'inspirational' | 'informative' | 'informal' | 'persuasive' | 'cooperative';

export const AI_TONES = [
  { id: 'formal' as AITonesProps, label: 'Formal' },
  { id: 'casual' as AITonesProps, label: 'Casual' },
  { id: 'enthusiastic' as AITonesProps, label: 'Enthusiastic' },
  { id: 'optimistic' as AITonesProps, label: 'Optimistic' },
  { id: 'conversational' as AITonesProps, label: 'Conversational' },
  { id: 'inspirational' as AITonesProps, label: 'Inspirational' },
  { id: 'informative' as AITonesProps, label: 'Informative' },
  { id: 'informal' as AITonesProps, label: 'Informal' },
  { id: 'persuasive' as AITonesProps, label: 'Persuasive' },
  { id: 'cooperative' as AITonesProps, label: 'Cooperative' },
] as const;

export interface AIJobDescriptionPayload {
  tone: AITonesProps;
  jobTitle: string;
  occupationId: number;
  specialtyId: number;
  workType?: string;
  workSetting?: string;
  locationCountry?: string;
  locationState: string;
  locationCity?: string;
  locationZipCode: string;
  locationAddress?: string;
  workFacility?: string;
  salaryCurrency?: string;
  salaryRangeStart?: number;
  salaryRangeEnd?: number;
  salaryType?: string;
  shiftType?: string;
  languages?: number[];
  companySize?: string;
}

export const jobsAdminApi = {
  async getJobs(filters: JobsAdminFilters = {}): Promise<JobsAdminResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.state) queryParams.append('state', filters.state);
    if (filters.jobStatus) queryParams.append('jobStatus', filters.jobStatus);
    if (filters.datePosted) queryParams.append('datePosted', filters.datePosted);
    if (filters.occupationId) queryParams.append('occupationId', filters.occupationId.toString());
    if (filters.specialtyId) queryParams.append('specialtyId', filters.specialtyId.toString());

    const endpoint = `/api/admin/jobs?${queryParams.toString()}`;
    
    return apiGet<JobsAdminResponse>(endpoint);
  },

  async getJobById(id: string): Promise<JobsAdminDetailsResponse> {
    return apiGet<JobsAdminDetailsResponse>(`/api/admin/jobs/${id}`);
  },

  async getOccupations(): Promise<OccupationsResponse> {
    return apiGet<OccupationsResponse>('/api/categories/occupations?page=1&limit=0');
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
    }>('/api/ai/job-description', payload);
  },

  async createJob(companyId: string, payload: JobCreationPayload): Promise<{ success: boolean; jobId?: string; message?: string }> {
    return apiPost<{ success: boolean; jobId?: string; message?: string }>(`/api/job_posts_management/admin/${companyId}`, payload);
  }
};
