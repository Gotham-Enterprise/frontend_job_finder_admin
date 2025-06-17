import { apiPost } from './apiUtils';

export interface JobPostingPayload {
  companyId: string;
  jobTitle: string;
  occupationId: number;
  specialtyId?: number;
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
  questions: JobQuestionPayload[];
  documents?: JobDocumentPayload[];
}


export interface JobQuestionPayload {
  questionText: string;
  questionTypeId: number;
  questionSubTypeId: number;
  questionSubTypeValueId?: number | null;
  options?: string[];
  required: boolean;
  isActive: boolean;
  isDefault: boolean;
}


export interface JobDocumentPayload {
  documentName: string;
  documentType: string;
  documentDescription: string;
}


export interface JobPostingResponse {
  success: boolean;
  data: {
    id: string;
    jobTitle: string;
  };
  message?: string;
}

export const jobPostingApi = {
  async createJobPost(companyId: string, payload: Omit<JobPostingPayload, 'companyId'>): Promise<JobPostingResponse> {
    const fullPayload: JobPostingPayload = {
      companyId,
      ...payload
    };
    
    return apiPost<JobPostingResponse>(
      `/api/job_posts_management/${companyId}`,
      fullPayload
    );
  }
};
