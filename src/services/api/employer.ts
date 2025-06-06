import { EmployerFilters, EmployersResponse, EmployerStatesResponse, EmployerDetailsResponse, CompanyReviewsResponse } from '../types/employer';
import { ApplicantDetailsResponse } from '../types/applicant';
import { authUtils } from '../utils/authUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const employerApi = {
  async getEmployers(filters: EmployerFilters = {}): Promise<EmployersResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.status) queryParams.append('status', filters.status);        
      const url = `${API_URL}/api/admin/employers?${queryParams.toString()}`;
      
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

  async getEmployerStates(): Promise<EmployerStatesResponse> {
    try {      const url = `${API_URL}/api/admin/employers/state/list`;
      
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
    } catch (error) {      throw error;
    }
  },

  async getEmployerById(id: string): Promise<EmployerDetailsResponse> {
    try {
      const url = `${API_URL}/api/admin/employers/${id}`;
      
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
      console.error('Error fetching employer details:', error);
      throw error;
    }
  },

  async getApplicantById(id: string): Promise<ApplicantDetailsResponse> {
    try {
      const url = `${API_URL}/api/admin/employers/applicant/${id}`;
      
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
      console.error('Error fetching applicant details:', error);      throw error;
    }
  },

  async getCompanyReviews(candidateId: string): Promise<CompanyReviewsResponse> {
    try {
      const url = `${API_URL}/api/admin/employers/reviews/${candidateId}`;
      
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
      console.error('Error fetching company reviews:', error);
      throw error;
    }
  },
};
