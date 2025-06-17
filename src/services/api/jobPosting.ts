import { apiPost } from './apiUtils';
import {JobPostingPayload, JobPostingResponse} from '@/services/types/jobCreation';

export const jobPostingApi = {
  async createJobPost(companyId: string, payload: Omit<JobPostingPayload, 'companyId'>): Promise<JobPostingResponse> {
    const fullPayload: JobPostingPayload = {
      companyId,
      ...payload
    };
    
    return apiPost<JobPostingResponse>(
      `/api/job_posts_management/admin/${companyId}`,
      fullPayload
    );
  }
};
