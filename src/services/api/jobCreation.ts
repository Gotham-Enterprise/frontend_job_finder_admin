import { JobCreationRequest, JobCreationResponse, OccupationsListResponse } from '../types/jobCreation';
import { apiPost, apiGet } from './apiUtils';

export const jobCreationApi = {
  async createJob(jobData: JobCreationRequest): Promise<JobCreationResponse> {
    return apiPost<JobCreationResponse>('/api/admin/jobs/create', jobData);
  },

  async getDegrees(): Promise<{ success: boolean; data: { id: number; name: string }[] }> {
    return apiGet<{ success: boolean; data: { id: number; name: string }[] }>(
      "/api/categories/degrees?limit=0",
    );
  },

  async getOccupationsWithSpecialties(options?: {
    /** Include isDropdown=false rows (supervision-only supervisee occupations). */
    includeAll?: boolean;
  }): Promise<OccupationsListResponse> {
    const includeAll = options?.includeAll ? '&includeAll=true' : '';
    return apiGet<OccupationsListResponse>(`/api/categories/occupations?page=1&limit=0${includeAll}`);
  },
};
