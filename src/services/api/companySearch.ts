import { CompanySearchFilters, CompanySearchResponse } from '../types/companySearch';
import { apiGet } from './apiUtils';

export const companySearchApi = {
  async searchCompanies(filters: CompanySearchFilters = {}): Promise<CompanySearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);

    const endpoint = `/api/admin/employers/search/list?${queryParams.toString()}`;
    
    return apiGet<CompanySearchResponse>(endpoint);
  },
};
