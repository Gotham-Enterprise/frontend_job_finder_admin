import { WorkTypeListResponse } from '../types/workType';
import { authUtils } from '../utils/authUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const workTypeApi = {
  async getWorkTypeList(): Promise<WorkTypeListResponse> {
    try {
      const url = `${API_URL}/api/categories/workTypes`;
      
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
            console.error('Error response text:', parseError);
          } catch (textError) {
            console.error('Could not get error response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching work types:', error);
      throw error;
    }
  },
};
