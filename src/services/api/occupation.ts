import { OccupationListResponse } from '../types/occupation';
import { apiGet } from './apiUtils';

export const occupationApi = {
  async getOccupationList(): Promise<OccupationListResponse> {
    return apiGet<OccupationListResponse>('/api/admin/jobseekers/occupation/list');
  },
};