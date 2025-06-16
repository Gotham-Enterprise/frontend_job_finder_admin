import { WorkTypeListResponse } from '../types/workType';
import { apiGet } from './apiUtils';

export const workTypeApi = {
  async getWorkTypeList(): Promise<WorkTypeListResponse> {
    return apiGet<WorkTypeListResponse>('/api/categories/workTypes');
  },
};
