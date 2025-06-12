import { JobCreationRequest, JobCreationResponse, OccupationsListResponse } from '../types/jobCreation';
import { authUtils } from '../utils/authUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const jobCreationApi = {
  async createJob(jobData: JobCreationRequest): Promise<JobCreationResponse> {
    try {
      const url = `${API_URL}/api/admin/jobs/create`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...authUtils.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobData),
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
      throw error;
    }
  },

  async getOccupationsWithSpecialties(): Promise<OccupationsListResponse> {
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
      throw error;
    }
  },
};
