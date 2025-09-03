import { JobSeekerFilters, JobSeekersResponse, JobSeekerDetailsResponse, JobSeekerUpdateData } from '../types/jobSeeker';
import { apiGet, apiPut, apiPost } from './apiUtils';

export const jobSeekerApi = {
  async getJobSeekers(filters: JobSeekerFilters = {}): Promise<JobSeekersResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('name', filters.search);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.radius) queryParams.append('radius', filters.radius.toString());
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.specialty) queryParams.append('specialty', filters.specialty);
    if (filters.occupationId) queryParams.append('occupationId', filters.occupationId.toString());
    if (filters.status) queryParams.append('status', filters.status);

    const endpoint = `/api/admin/jobseekers?${queryParams.toString()}`;
    
    return apiGet<JobSeekersResponse>(endpoint);
  },

  async viewResume(resumeId: string): Promise<any> {
    return apiGet<any>(`/api/resumes/${resumeId}/view`);
  },

  async getJobSeekerById(id: string): Promise<JobSeekerDetailsResponse> {
    return apiGet<JobSeekerDetailsResponse>(`/api/admin/jobseekers/${id}`);
  },

  async updateJobSeeker(id: string, data: JobSeekerUpdateData): Promise<any> {
    return apiPut<any>(`/api/admin/jobseekers/${id}`, data);
  },

  async unlockJobSeekerAccount(id: string): Promise<any> {
    return apiPost<any>(`/api/admin/jobseekers/${id}/unlock`, {});
  },
};
