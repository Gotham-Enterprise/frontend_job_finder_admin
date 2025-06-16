import { WorkSettingsListResponse } from '@/services/types/workSettings';
import { apiGet } from './apiUtils';

export const workSettingsApi = {
  async getWorkSettingsList(): Promise<WorkSettingsListResponse> {
    return apiGet<WorkSettingsListResponse>('/api/categories/workSettings');
  },
};
