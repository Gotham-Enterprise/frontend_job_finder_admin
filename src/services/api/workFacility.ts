import { WorkFacilityListResponse } from '../types/workFacility';
import { apiGet } from './apiUtils';

export const workFacilityApi = {
  async getWorkFacilityList(): Promise<WorkFacilityListResponse> {
    return apiGet<WorkFacilityListResponse>('/api/categories/workFacilities');
  },
};
