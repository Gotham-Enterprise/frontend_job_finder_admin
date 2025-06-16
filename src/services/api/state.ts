import { StateListResponse } from '../types/state';
import { apiGet } from './apiUtils';

export const stateApi = {
  async getStateList(): Promise<StateListResponse> {
    return apiGet<StateListResponse>('/api/categories/us_states');
  },
};
