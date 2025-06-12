import { JobsAdminFilters, JobsAdminResponse, JobsAdminDetailsResponse, OccupationsResponse } from '../types/jobsAdmin';
import { authUtils } from '../utils/authUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const jobsAdminApi = {
  async getJobs(filters: JobsAdminFilters = {}): Promise<JobsAdminResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.jobStatus) queryParams.append('jobStatus', filters.jobStatus);
      if (filters.datePosted) queryParams.append('datePosted', filters.datePosted);
      if (filters.occupationId) queryParams.append('occupationId', filters.occupationId.toString());
      if (filters.specialtyId) queryParams.append('specialtyId', filters.specialtyId.toString());

      const url = `${API_URL}/api/admin/jobs?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('Could not get error response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  async getJobById(id: string): Promise<JobsAdminDetailsResponse> {
    try {
      const url = `${API_URL}/api/admin/jobs/${id}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('Could not get error response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching job details:', error);
      throw error;
    }
  },

  async getOccupations(): Promise<OccupationsResponse> {
    try {
      const url = `${API_URL}/api/categories/occupations?page=1&limit=0`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('Could not get error response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching occupations:', error);
      throw error;
    }
  }
};
