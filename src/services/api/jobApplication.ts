import { JobApplicationFilters, JobApplicationsResponse, JobApplicationDetailsResponse } from '../types/jobApplication';
import { apiGet } from './apiUtils';

export const jobApplicationApi = {
  async getJobApplications(filters: JobApplicationFilters = {}): Promise<JobApplicationsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.companyName) queryParams.append('companyName', filters.companyName);
    if (filters.status) queryParams.append('status', filters.status);

    const endpoint = `/api/admin/applications?${queryParams.toString()}`;
    

    return apiGet<JobApplicationsResponse>(endpoint);
  },

  async viewResume(resumeObjectKey: string): Promise<any> {
    const endpoint = `/api/file?type=resume&field=fileObjectKey&value=${encodeURIComponent(resumeObjectKey)}`;
    return apiGet<any>(endpoint);
  },

  async getJobApplicationById(id: string): Promise<JobApplicationDetailsResponse> {
    return apiGet<JobApplicationDetailsResponse>(`/api/admin/applications/${id}`);
  },
};
