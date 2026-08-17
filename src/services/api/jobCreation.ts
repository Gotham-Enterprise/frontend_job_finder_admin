import { JobCreationRequest, JobCreationResponse, OccupationsListResponse } from '../types/jobCreation';
import { apiPost, apiGet } from './apiUtils';

export const jobCreationApi = {
  async createJob(jobData: JobCreationRequest): Promise<JobCreationResponse> {
    return apiPost<JobCreationResponse>('/api/admin/jobs/create', jobData);
  },

  async getOccupationsWithSpecialties(options?: {
    /** Include isDropdown=false rows (supervision-only supervisee occupations). */
    includeAll?: boolean;
  }): Promise<OccupationsListResponse> {
    const includeAll = options?.includeAll ? '&includeAll=true' : '';
    return apiGet<OccupationsListResponse>(`/api/categories/occupations?page=1&limit=0${includeAll}`);
  },
};
