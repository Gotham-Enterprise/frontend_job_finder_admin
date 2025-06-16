import { JobsAdminFilters, JobsAdminResponse, JobsAdminDetailsResponse, OccupationsResponse } from '../types/jobsAdmin';
import { apiGet } from './apiUtils';

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
  }
};
