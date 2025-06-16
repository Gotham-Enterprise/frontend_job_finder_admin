import { ClinicSizeListResponse } from '../types/clinicSize';
import { apiGet } from './apiUtils';

export const clinicSizeApi = {
  async getClinicSizeList(): Promise<ClinicSizeListResponse> {
    return apiGet<ClinicSizeListResponse>('/api/categories/clinicSizes');
  },
};
