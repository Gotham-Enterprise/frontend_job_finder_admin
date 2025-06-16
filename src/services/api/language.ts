import { LanguageListResponse } from '../types/language';
import { apiGet } from './apiUtils';

export const languageApi = {
  async getLanguageList(): Promise<LanguageListResponse> {
    return apiGet<LanguageListResponse>('/api/categories/languages');
  },
};
