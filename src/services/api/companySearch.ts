import { CompanySearchFilters, CompanySearchResponse } from '../types/companySearch';
import { apiGet } from './apiUtils';

export const companySearchApi = {
  async searchCompanies(filters: CompanySearchFilters = {}): Promise<CompanySearchResponse> {
    const queryParams = new URLSearchParams();
    
   
    if (filters.search) queryParams.append('name', filters.search);

    const endpoint = `/api/admin/employers/search/list?${queryParams.toString()}`;
    
    return apiGet<CompanySearchResponse>(endpoint);
  },
};
