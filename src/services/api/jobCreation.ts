import { JobCreationRequest, JobCreationResponse, OccupationsListResponse } from '../types/jobCreation';
import { apiPost, apiGet } from './apiUtils';

export const jobCreationApi = {
  async createJob(jobData: JobCreationRequest): Promise<JobCreationResponse> {
    return apiPost<JobCreationResponse>('/api/admin/jobs/create', jobData);
  },

  async getOccupationsWithSpecialties(): Promise<OccupationsListResponse> {
    return apiGet<OccupationsListResponse>('/api/categories/occupations?page=1&limit=0');
  },
};
