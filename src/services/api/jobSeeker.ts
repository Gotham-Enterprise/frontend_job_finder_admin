import { JobSeekerFilters, JobSeekersResponse } from '../types/jobSeeker';
import { authUtils } from '../utils/authUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const jobSeekerApi = {
  async getJobSeekers(filters: JobSeekerFilters = {}): Promise<JobSeekersResponse> {
    try {
      const queryParams = new URLSearchParams();      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.specialty) queryParams.append('specialty', filters.specialty);
      if (filters.occupationId) queryParams.append('occupationId', filters.occupationId.toString());
      if (filters.status) queryParams.append('status', filters.status);

      const url = `${API_URL}/api/admin/jobseekers?${queryParams.toString()}`;   
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
            console.error(' Could not get error response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
 
};
