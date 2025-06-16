import { LocationValidationResponse, LocationValidationRequest } from '../types/location';
import { apiRequest } from './apiUtils';

export const locationApi = {
  async validateLocation(data: LocationValidationRequest): Promise<LocationValidationResponse> {
    return apiRequest<LocationValidationResponse>('/api/locations/validate', {
      method: 'POST',
      body: data,
    });
  },
};
