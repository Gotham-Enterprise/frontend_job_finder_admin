import { JobDetailsResponse, JobDetailsFilters } from '../types/job';
import { apiGet } from './apiUtils';

export const jobAPI = {
  async getJobDetails(jobId: string, filters?: JobDetailsFilters): Promise<JobDetailsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const endpoint = `/api/admin/employers/job/${jobId}?${queryParams.toString()}`;
    
    return apiGet<JobDetailsResponse>(endpoint);
  }
};
