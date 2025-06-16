import { EmployerFilters, 
  EmployersResponse,
   EmployerStatesResponse,
   EmployerDetailsResponse,
    CompanyReviewsResponse } from '../types/employer';
import { ApplicantDetailsResponse } from '../types/applicant';
import { apiGet } from './apiUtils';
import { showToast } from '../utils/toast';

export const employerApi = {
  async getEmployers(filters: EmployerFilters = {}): Promise<EmployersResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.location) queryParams.append('location', filters.location);     
      if (filters.status) queryParams.append('status', filters.status);        
      
      const endpoint = `/api/admin/employers?${queryParams.toString()}`;
      
      return apiGet<EmployersResponse>(endpoint);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast.error('Employer Error', errorMessage);
      throw error;
    }
  },
  
  async getEmployerById(id: string): Promise<EmployerDetailsResponse> {
    return apiGet<EmployerDetailsResponse>(`/api/admin/employers/${id}`);
  },

  async getApplicantById(id: string): Promise<ApplicantDetailsResponse> {
    return apiGet<ApplicantDetailsResponse>(`/api/admin/employers/applicant/${id}`);
  },

  async getCompanyReviews(id: string): Promise<CompanyReviewsResponse> {
    return apiGet<CompanyReviewsResponse>(`/api/admin/employers/reviews/${id}`);
  },
};
