import { OccupationListResponse } from '../types/occupation';
import { apiGet } from './apiUtils';

export const occupationApi = {
  async getOccupationList(): Promise<OccupationListResponse> {
    return apiGet<OccupationListResponse>('/api/admin/jobseekers/occupation/list');
  },

  /** Dropdown catalog used by job-seeker registration (`isDropdown: true`). */
  async getDropdownOccupations(): Promise<OccupationListResponse> {
    return apiGet<OccupationListResponse>('/api/categories/occupations?page=1&limit=0');
  },
};