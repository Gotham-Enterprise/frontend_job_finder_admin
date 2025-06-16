import { ShiftTypeListResponse } from '../types/shiftType';
import { apiGet } from './apiUtils';

export const shiftTypeApi = {
  async getShiftTypeList(): Promise<ShiftTypeListResponse> {
    return apiGet<ShiftTypeListResponse>('/api/categories/shiftTypes');
  },
};
